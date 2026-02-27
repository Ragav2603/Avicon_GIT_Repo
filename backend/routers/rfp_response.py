"""RFP Response Wizard — AI-powered draft generation.

Two-step workflow:
  Step 1: Select KB documents for context
  Step 2: AI generates RFP response draft using templates + context
"""
import time
import uuid
import logging
from typing import List

from fastapi import APIRouter, Request, HTTPException

from models.schemas import (
    RFPDraftRequest, RFPDraftResponse, RFPTemplate,
    ContextualChatRequest, ContextualChatResponse,
)
from services.pii_masker import mask_pii
from services.doc_extractor import extract_text

logger = logging.getLogger("avicon.rfp_response")

router = APIRouter(prefix="/rfp-response", tags=["rfp-response"])

# ─── Aviation-specific RFP Templates ─────────────
AVIATION_TEMPLATES: List[RFPTemplate] = [
    RFPTemplate(
        id="tpl-ife-001",
        name="In-Flight Entertainment System",
        category="IFE",
        description="Response template for IFE hardware/software procurement",
        prompt_template=(
            "You are drafting an RFP response for an In-Flight Entertainment system. "
            "Use the provided context documents to address: content licensing, hardware specs, "
            "passenger experience metrics, and integration requirements. "
            "Format the response with clear sections: Executive Summary, Technical Approach, "
            "Timeline, and Pricing Framework."
        ),
    ),
    RFPTemplate(
        id="tpl-mro-001",
        name="MRO Services",
        category="MRO",
        description="Template for Maintenance, Repair & Overhaul service proposals",
        prompt_template=(
            "You are drafting an RFP response for MRO services. "
            "Use the provided context to detail: maintenance capabilities, turnaround times, "
            "certifications (EASA/FAA), fleet compatibility, and parts inventory management. "
            "Structure: Executive Summary, Service Capabilities, SLA Commitments, Compliance."
        ),
    ),
    RFPTemplate(
        id="tpl-catering-001",
        name="Airline Catering",
        category="Catering",
        description="Template for airline food & beverage procurement",
        prompt_template=(
            "You are drafting an RFP response for airline catering services. "
            "Address: menu diversity, dietary compliance (halal/kosher/vegan), "
            "food safety certifications, hub coverage, and cost-per-meal structure. "
            "Structure: Company Overview, Menu Proposition, Quality & Safety, Logistics."
        ),
    ),
    RFPTemplate(
        id="tpl-ground-001",
        name="Ground Handling",
        category="Ground Handling",
        description="Template for airport ground handling services",
        prompt_template=(
            "You are drafting an RFP response for ground handling services. "
            "Cover: ramp handling, passenger services, baggage handling, de-icing, "
            "airport coverage network, and ISAGO certification status. "
            "Structure: Overview, Service Portfolio, Performance KPIs, Pricing Model."
        ),
    ),
    RFPTemplate(
        id="tpl-connectivity-001",
        name="In-Flight Connectivity",
        category="Connectivity",
        description="Template for Wi-Fi and connectivity system proposals",
        prompt_template=(
            "You are drafting an RFP response for in-flight connectivity. "
            "Address: bandwidth capabilities, satellite partnerships (LEO/GEO), "
            "STC coverage, installation timelines, and per-aircraft pricing. "
            "Structure: Technical Solution, Coverage Map, Performance SLAs, Commercials."
        ),
    ),
    RFPTemplate(
        id="tpl-loyalty-001",
        name="Loyalty Platform",
        category="Digital",
        description="Template for frequent flyer / loyalty program technology",
        prompt_template=(
            "You are drafting an RFP response for a loyalty platform. "
            "Cover: member management, points earning/redemption engine, "
            "partner integration APIs, analytics dashboard, and data privacy compliance. "
            "Structure: Platform Architecture, Feature Set, Integration Plan, Data Governance."
        ),
    ),
]


def _get_db(request: Request):
    return request.app.state.db if hasattr(request.app.state, 'db') else None


def _get_user_id(request: Request) -> str:
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user.get("sub", "")


async def _gather_doc_context(db, document_ids: List[str], user_id: str) -> tuple:
    """Extract text content from selected KB documents. Returns (context_str, doc_records)."""
    if db is None or not document_ids:
        return "", []

    docs = await db.kb_documents.find(
        {"id": {"$in": document_ids}, "user_id": user_id},
        {"_id": 0}
    ).to_list(20)

    context_parts = []
    for doc in docs:
        context_parts.append(f"\n--- Document: {doc['name']} ---")
        text = extract_text(doc.get("storage_path", ""))
        if text:
            context_parts.append(text)
        else:
            context_parts.append(f"[Could not extract text from {doc['name']}]")

    return "\n".join(context_parts), docs


@router.get("/templates", response_model=List[RFPTemplate])
async def list_templates():
    """List all available aviation-specific RFP response templates."""
    return AVIATION_TEMPLATES


@router.post("/draft", response_model=RFPDraftResponse)
async def generate_draft(request: Request, body: RFPDraftRequest):
    """Generate an AI-powered RFP response draft.

    Uses selected KB documents as context + an optional template.
    """
    user_id = _get_user_id(request)
    db = _get_db(request)
    start = time.time()

    masked_context = mask_pii(body.rfp_context)

    # Determine template
    template_prompt = ""
    template_name = None
    if body.template_id:
        template = next((t for t in AVIATION_TEMPLATES if t.id == body.template_id), None)
        if template:
            template_prompt = template.prompt_template
            template_name = template.name

    # Gather document context
    doc_context, docs = await _gather_doc_context(db, body.document_ids, user_id)

    # Build the prompt
    system_prompt = template_prompt or (
        "You are an expert aviation procurement consultant. "
        "Generate a professional RFP response draft based on the provided context and requirements. "
        "Use clear headings, professional tone, and specific details from the context."
    )

    full_prompt = f"{system_prompt}\n\n"
    if doc_context:
        full_prompt += f"Reference Documents:\n{doc_context}\n\n"
    full_prompt += f"RFP Requirement:\n{masked_context}\n\nGenerate a complete, well-structured RFP response draft:"

    # Call Azure OpenAI via LlamaIndex
    try:
        from services.rag_engine import _get_llm
        llm = _get_llm()
        result = await llm.acomplete(full_prompt)
        draft_text = result.text
    except Exception as e:
        logger.error(f"RFP_DRAFT_ERROR | user={user_id} | error={e}")
        draft_text = (
            "# Draft Response\n\n"
            f"*AI generation encountered an error: {str(e)[:200]}*\n\n"
            f"## Context Provided\n{body.rfp_context[:500]}...\n\n"
            "## Recommended Structure\n"
            "1. Executive Summary\n2. Technical Approach\n3. Timeline\n4. Pricing\n"
        )

    latency = round((time.time() - start) * 1000, 2)
    logger.info(f"RFP_DRAFT | user={user_id} | template={template_name} | docs={len(docs)} | latency={latency}ms")

    return RFPDraftResponse(
        draft=draft_text,
        template_used=template_name,
        sources=[{"name": d.get("name", "")} for d in docs],
        latency_ms=latency,
    )


@router.post("/chat", response_model=ContextualChatResponse)
async def contextual_chat(request: Request, body: ContextualChatRequest):
    """Contextual AI chat — query specific KB documents."""
    user_id = _get_user_id(request)
    db = _get_db(request)
    start = time.time()

    masked_query = mask_pii(body.query)
    session_id = body.session_id or str(uuid.uuid4())

    # Gather document context
    doc_context, docs = await _gather_doc_context(db, body.document_ids, user_id)

    prompt = (
        "You are an enterprise AI assistant for the Avicon aviation procurement platform. "
        "Answer questions based strictly on the provided documents. "
        "Be precise, professional, and cite specific document sections when possible.\n\n"
    )
    if doc_context:
        prompt += f"Documents:\n{doc_context}\n\n"
    prompt += f"Question: {masked_query}\n\nAnswer:"

    try:
        from services.rag_engine import _get_llm
        llm = _get_llm()
        result = await llm.acomplete(prompt)
        response_text = result.text
    except Exception as e:
        logger.error(f"KB_CHAT_ERROR | user={user_id} | error={e}")
        response_text = f"I'm sorry, I couldn't process your question. Error: {str(e)[:200]}"

    latency = round((time.time() - start) * 1000, 2)
    logger.info(f"KB_CHAT | user={user_id} | docs={len(docs)} | latency={latency}ms")

    return ContextualChatResponse(
        response=response_text,
        session_id=session_id,
        sources=[{"name": d.get("name", "")} for d in docs],
        latency_ms=latency,
    )

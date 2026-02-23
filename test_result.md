#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Enterprise transformation of Avicon platform - Phase 1: Secure bridge between Supabase Edge Functions and Azure-hosted FastAPI backend, with integrated RAG engine, multi-tenant security, PII masking, audit logging, rate limiting, and enterprise UX."

backend:
  - task: "Health endpoint returns service status"
    implemented: true
    working: "NA"
    file: "backend/routers/health.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: "Implemented health endpoint with MongoDB, Pinecone, Azure OpenAI, Supabase status checks"

  - task: "JWT Auth middleware verifies Supabase tokens"
    implemented: true
    working: "NA"
    file: "backend/middleware/auth.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: "JWT middleware verifies tokens via Supabase auth.getUser() server-side. Injects user into request.state"

  - task: "Rate limiting middleware"
    implemented: true
    working: "NA"
    file: "backend/middleware/rate_limiter.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: "Sliding window rate limiter with burst/minute/hour limits. Returns 429 with Retry-After headers"

  - task: "Audit logging middleware persists to MongoDB"
    implemented: true
    working: "NA"
    file: "backend/middleware/audit.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: "Logs all requests to /api/query, /api/documents paths to MongoDB audit_logs collection"

  - task: "RAG query endpoint with namespace isolation"
    implemented: true
    working: "NA"
    file: "backend/routers/query.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: "POST /api/query/ - customer_id from JWT, Pinecone namespace isolation, PII masking, caching"

  - task: "Document upload endpoint with auth"
    implemented: true
    working: "NA"
    file: "backend/routers/documents.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: "POST /api/documents/upload - authenticated uploads, file validation, LlamaParse processing"

  - task: "PII masking service"
    implemented: true
    working: "NA"
    file: "backend/services/pii_masker.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: "Regex-based PII masking for emails, phones, SSNs, credit cards, IPs before LLM"

  - task: "Legacy status endpoints backward compatibility"
    implemented: true
    working: "NA"
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: "GET/POST /api/status maintained for backward compatibility"

frontend:
  - task: "Frontend startup fixed (yarn start)"
    implemented: true
    working: true
    file: "frontend/package.json, frontend/vite.config.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: "Added 'start' script to package.json, fixed vite port to 3000"

  - task: "AIChatbot routes through secure backend (no more hardcoded Azure URL)"
    implemented: true
    working: "NA"
    file: "frontend/src/components/Chat/AIChatbot.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        - working: "NA"
          agent: "main"
          comment: "Removed hardcoded Azure URL. Now routes through REACT_APP_BACKEND_URL/api/query/ and /api/documents/upload with JWT auth headers"

  - task: "Edge Function ai-proxy hardened"
    implemented: true
    working: "NA"
    file: "frontend/supabase/functions/ai-proxy/index.ts"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: "NA"
          agent: "main"
          comment: "Configurable backend URL, input validation, audit logging, request ID tracking, JWT forwarding"

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Health endpoint returns service status"
    - "JWT Auth middleware verifies Supabase tokens"
    - "Rate limiting middleware"
    - "Audit logging middleware persists to MongoDB"
    - "PII masking service"
    - "Legacy status endpoints backward compatibility"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    - agent: "main"
      message: "Phase 1 implementation complete. Backend refactored with enterprise middleware stack (JWT auth, rate limiter, audit logger), integrated RAG engine from standalone-ai-backend, PII masking service, and document upload endpoint. Frontend AIChatbot now routes through secure backend. Please test public endpoints first (health, status), then test that protected endpoints correctly reject unauthenticated requests with 401."
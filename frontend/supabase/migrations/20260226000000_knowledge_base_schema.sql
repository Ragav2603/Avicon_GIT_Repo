-- ============================================
-- Avicon Knowledge Base Schema
-- Phase: Request & Adoption Platform
-- ============================================

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    doc_limit INTEGER DEFAULT 100,
    folder_limit INTEGER DEFAULT 20,
    max_file_size_mb NUMERIC DEFAULT 20.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Folders table
CREATE TABLE IF NOT EXISTS public.kb_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    name TEXT NOT NULL CHECK (char_length(name) <= 100),
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.kb_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES public.kb_folders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_mb NUMERIC NOT NULL CHECK (file_size_mb <= 20.0),
    source_type TEXT NOT NULL DEFAULT 'local' CHECK (source_type IN ('local', 'sharepoint', 'onedrive', 'gdocs')),
    mime_type TEXT,
    status TEXT DEFAULT 'ready' CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kb_folders_user ON public.kb_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_folders_org ON public.kb_folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_documents_folder ON public.kb_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_kb_documents_user ON public.kb_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_documents_source ON public.kb_documents(source_type);

-- RLS Policies
ALTER TABLE public.kb_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_documents ENABLE ROW LEVEL SECURITY;

-- Folder policies
CREATE POLICY kb_folders_user_select ON public.kb_folders
    FOR SELECT USING (auth.uid() = user_id OR NOT is_private);

CREATE POLICY kb_folders_user_insert ON public.kb_folders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY kb_folders_user_update ON public.kb_folders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY kb_folders_user_delete ON public.kb_folders
    FOR DELETE USING (auth.uid() = user_id);

-- Document policies
CREATE POLICY kb_documents_user_select ON public.kb_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY kb_documents_user_insert ON public.kb_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY kb_documents_user_delete ON public.kb_documents
    FOR DELETE USING (auth.uid() = user_id);

-- Function to enforce folder limits
CREATE OR REPLACE FUNCTION check_folder_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_count INTEGER;
    org_count INTEGER;
    org_folder_limit INTEGER;
BEGIN
    -- Check per-user limit (10)
    SELECT COUNT(*) INTO user_count FROM public.kb_folders WHERE user_id = NEW.user_id;
    IF user_count >= 10 THEN
        RAISE EXCEPTION 'Maximum 10 folders per user';
    END IF;

    -- Check per-org limit (20)
    IF NEW.organization_id IS NOT NULL THEN
        SELECT folder_limit INTO org_folder_limit FROM public.organizations WHERE id = NEW.organization_id;
        SELECT COUNT(*) INTO org_count FROM public.kb_folders WHERE organization_id = NEW.organization_id;
        IF org_count >= COALESCE(org_folder_limit, 20) THEN
            RAISE EXCEPTION 'Organization folder limit reached';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_folder_limit_trigger
    BEFORE INSERT ON public.kb_folders
    FOR EACH ROW EXECUTE FUNCTION check_folder_limit();

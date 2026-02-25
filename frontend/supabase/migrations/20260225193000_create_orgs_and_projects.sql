-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create organization_members table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_members
CREATE POLICY "Users view own org memberships" ON public.organization_members
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Org owners can manage members" ON public.organization_members
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.org_id = organization_members.org_id
    AND om.user_id = auth.uid()
    AND om.org_role = 'owner'
  )
);

-- RLS Policies for organizations
CREATE POLICY "Users can view their orgs" ON public.organizations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.org_id = organizations.id
    AND organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create orgs" ON public.organizations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

-- RLS Policies for projects
CREATE POLICY "Users can view projects in their orgs" ON public.projects
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.org_id = projects.org_id
    AND organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Org members can create projects" ON public.projects
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.org_id = projects.org_id
    AND organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Org members can update projects" ON public.projects
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_members.org_id = projects.org_id
    AND organization_members.user_id = auth.uid()
  )
);

-- Add RLS policies for audit_items table
-- Allow consultants and airlines to view audit items for audits they can access
CREATE POLICY "Users view authorized audit items" ON public.audit_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.adoption_audits
    WHERE adoption_audits.id = audit_items.audit_id
    AND (adoption_audits.consultant_id = auth.uid() 
         OR adoption_audits.airline_id = auth.uid())
  )
);

-- Allow consultants to insert items for their audits
CREATE POLICY "Consultants can insert audit items" ON public.audit_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.adoption_audits
    WHERE adoption_audits.id = audit_items.audit_id
    AND adoption_audits.consultant_id = auth.uid()
  )
);

-- Allow consultants to update items for their audits
CREATE POLICY "Consultants can update audit items" ON public.audit_items
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.adoption_audits
    WHERE adoption_audits.id = audit_items.audit_id
    AND adoption_audits.consultant_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.adoption_audits
    WHERE adoption_audits.id = audit_items.audit_id
    AND adoption_audits.consultant_id = auth.uid()
  )
);

-- Allow consultants to delete items for their audits
CREATE POLICY "Consultants can delete audit items" ON public.audit_items
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.adoption_audits
    WHERE adoption_audits.id = audit_items.audit_id
    AND adoption_audits.consultant_id = auth.uid()
  )
);
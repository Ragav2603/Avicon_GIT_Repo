-- Create consulting_requests table
CREATE TABLE public.consulting_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  problem_area TEXT NOT NULL CHECK (problem_area IN ('process', 'tooling', 'strategy')),
  message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 2000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consulting_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own requests
CREATE POLICY "Users can create consulting requests"
ON public.consulting_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests
CREATE POLICY "Users can view their own requests"
ON public.consulting_requests FOR SELECT
USING (auth.uid() = user_id);

-- Consultants can view all requests
CREATE POLICY "Consultants can view all requests"
ON public.consulting_requests FOR SELECT
USING (has_role(auth.uid(), 'consultant'));

-- Consultants can update request status
CREATE POLICY "Consultants can update request status"
ON public.consulting_requests FOR UPDATE
USING (has_role(auth.uid(), 'consultant'));
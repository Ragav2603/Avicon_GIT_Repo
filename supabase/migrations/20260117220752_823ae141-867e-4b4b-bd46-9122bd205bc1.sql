-- Add CHECK constraints to rfps table
ALTER TABLE public.rfps
ADD CONSTRAINT rfps_title_length CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
ADD CONSTRAINT rfps_description_length CHECK (description IS NULL OR (char_length(description) >= 20 AND char_length(description) <= 5000));

-- Add CHECK constraints to submissions table
ALTER TABLE public.submissions
ADD CONSTRAINT submissions_pitch_length CHECK (pitch_text IS NULL OR (char_length(pitch_text) >= 10 AND char_length(pitch_text) <= 10000));

-- Add email format validation to profiles (allowing NULL)
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add constraints to rfp_requirements
ALTER TABLE public.rfp_requirements
ADD CONSTRAINT req_text_length CHECK (char_length(requirement_text) > 0 AND char_length(requirement_text) <= 1000),
ADD CONSTRAINT req_weight_range CHECK (weight IS NULL OR (weight >= 1 AND weight <= 10));
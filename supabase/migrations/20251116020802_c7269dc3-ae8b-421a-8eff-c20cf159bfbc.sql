-- Create enum for submission status
CREATE TYPE public.submission_status AS ENUM ('new', 'contacted', 'scheduled', 'completed');

-- Create HRT quiz submissions table
CREATE TABLE public.hrt_quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contact Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Demographics
  age_range TEXT NOT NULL,
  gender TEXT NOT NULL,
  
  -- Quiz Data
  symptoms TEXT[] NOT NULL,
  symptom_duration TEXT NOT NULL,
  past_hrt TEXT NOT NULL,
  past_hrt_details TEXT,
  medical_conditions TEXT,
  current_medications TEXT,
  primary_goal TEXT NOT NULL,
  insurance TEXT NOT NULL,
  
  -- Tracking
  status submission_status NOT NULL DEFAULT 'new',
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  contacted_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.hrt_quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for hrt_quiz_submissions
CREATE POLICY "Admins and staff can view all submissions"
  ON public.hrt_quiz_submissions
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Admins and staff can update submissions"
  ON public.hrt_quiz_submissions
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Admins can delete submissions"
  ON public.hrt_quiz_submissions
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow public insert for quiz submissions (from the form)
CREATE POLICY "Anyone can submit quiz"
  ON public.hrt_quiz_submissions
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER handle_hrt_submissions_updated_at
  BEFORE UPDATE ON public.hrt_quiz_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_hrt_submissions_status ON public.hrt_quiz_submissions(status);
CREATE INDEX idx_hrt_submissions_created_at ON public.hrt_quiz_submissions(created_at DESC);
CREATE INDEX idx_hrt_submissions_email ON public.hrt_quiz_submissions(email);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Enable RLS on missing tables
ALTER TABLE public.analysis_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_analyses ENABLE ROW LEVEL SECURITY;

-- Create public policies for these tables (since no auth is needed)
CREATE POLICY "Allow public access to analysis_exports" 
ON public.analysis_exports 
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public access to pricing_analyses" 
ON public.pricing_analyses 
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public access to profiles" 
ON public.profiles 
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public access to sample_analyses" 
ON public.sample_analyses 
FOR ALL
USING (true)
WITH CHECK (true);
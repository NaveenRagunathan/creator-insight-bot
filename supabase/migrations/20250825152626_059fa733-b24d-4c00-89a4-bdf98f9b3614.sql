-- Create table for storing website audits
CREATE TABLE public.website_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_url TEXT NOT NULL,
  social_url TEXT,
  email TEXT,
  audit_results JSONB NOT NULL,
  overall_score INTEGER,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_audits ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no auth required)
CREATE POLICY "Allow public access to website_audits" 
ON public.website_audits 
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_website_audits_updated_at
BEFORE UPDATE ON public.website_audits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
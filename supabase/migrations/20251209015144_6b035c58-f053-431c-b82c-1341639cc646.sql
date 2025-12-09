
-- Create letterhead settings table for each institution
CREATE TABLE public.letterhead_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  logo_url TEXT,
  institution_name TEXT NOT NULL,
  address TEXT,
  contact TEXT,
  custom_header TEXT, -- Rich text content for additional header info
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(institution_id)
);

-- Create letter templates table
CREATE TABLE public.letter_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.letterhead_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for letterhead_settings
CREATE POLICY "Institution users can view letterhead"
ON public.letterhead_settings FOR SELECT
USING (institution_id = get_user_institution(auth.uid()));

CREATE POLICY "Institution admins can manage letterhead"
ON public.letterhead_settings FOR ALL
USING (institution_id = get_user_institution(auth.uid()) AND has_role(auth.uid(), 'admin_instansi'));

-- RLS Policies for letter_templates
CREATE POLICY "Institution users can view templates"
ON public.letter_templates FOR SELECT
USING (institution_id = get_user_institution(auth.uid()));

CREATE POLICY "Institution admins can insert templates"
ON public.letter_templates FOR INSERT
WITH CHECK (institution_id = get_user_institution(auth.uid()) AND has_role(auth.uid(), 'admin_instansi'));

CREATE POLICY "Institution admins can update templates"
ON public.letter_templates FOR UPDATE
USING (institution_id = get_user_institution(auth.uid()) AND has_role(auth.uid(), 'admin_instansi'));

CREATE POLICY "Institution admins can delete templates"
ON public.letter_templates FOR DELETE
USING (institution_id = get_user_institution(auth.uid()) AND has_role(auth.uid(), 'admin_instansi'));

-- Triggers for updated_at
CREATE TRIGGER update_letterhead_settings_updated_at
BEFORE UPDATE ON public.letterhead_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_letter_templates_updated_at
BEFORE UPDATE ON public.letter_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

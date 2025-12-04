-- Create enum for letter status
CREATE TYPE public.letter_status AS ENUM (
  'received',
  'review', 
  'disposition',
  'in_progress',
  'completed',
  'archived'
);

-- Create institutions table
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  signature_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin_instansi', 'user_instansi', 'visitor');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role, institution_id)
);

-- Create incoming letters table
CREATE TABLE public.incoming_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  ticket_number TEXT UNIQUE NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  subject TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  status letter_status DEFAULT 'received',
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create outgoing letters table
CREATE TABLE public.outgoing_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  letter_number TEXT NOT NULL,
  subject TEXT NOT NULL,
  recipient TEXT NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  final_pdf_url TEXT,
  status letter_status DEFAULT 'review',
  document_hash TEXT,
  qr_code_url TEXT,
  is_signed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create digital signatures table
CREATE TABLE public.digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID REFERENCES public.outgoing_letters(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  signature_image_url TEXT NOT NULL,
  signature_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create letter verifications table (for QR code scan logs)
CREATE TABLE public.letter_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID REFERENCES public.outgoing_letters(id) ON DELETE CASCADE NOT NULL,
  verification_hash TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  is_valid BOOLEAN DEFAULT true
);

-- Create dispositions table
CREATE TABLE public.dispositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID REFERENCES public.incoming_letters(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES auth.users(id) NOT NULL,
  to_user_id UUID REFERENCES auth.users(id) NOT NULL,
  instructions TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incoming_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outgoing_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispositions ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
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

-- Function to get user's institution
CREATE OR REPLACE FUNCTION public.get_user_institution(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_id
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for institutions
CREATE POLICY "Public can view active institutions"
ON public.institutions FOR SELECT
USING (is_active = true);

CREATE POLICY "Superadmin can manage all institutions"
ON public.institutions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for incoming_letters
CREATE POLICY "Institution users can view their letters"
ON public.incoming_letters FOR SELECT
TO authenticated
USING (institution_id = public.get_user_institution(auth.uid()));

CREATE POLICY "Public can insert incoming letters"
ON public.incoming_letters FOR INSERT
WITH CHECK (true);

CREATE POLICY "Institution admins can update letters"
ON public.incoming_letters FOR UPDATE
TO authenticated
USING (institution_id = public.get_user_institution(auth.uid()));

-- RLS Policies for outgoing_letters
CREATE POLICY "Institution users can view outgoing letters"
ON public.outgoing_letters FOR SELECT
TO authenticated
USING (institution_id = public.get_user_institution(auth.uid()));

CREATE POLICY "Institution users can insert outgoing letters"
ON public.outgoing_letters FOR INSERT
TO authenticated
WITH CHECK (institution_id = public.get_user_institution(auth.uid()));

CREATE POLICY "Institution users can update outgoing letters"
ON public.outgoing_letters FOR UPDATE
TO authenticated
USING (institution_id = public.get_user_institution(auth.uid()));

-- Public can view outgoing letters for verification
CREATE POLICY "Public can view letters for verification"
ON public.outgoing_letters FOR SELECT
USING (is_signed = true AND status = 'completed');

-- RLS Policies for digital_signatures
CREATE POLICY "Users can view signatures"
ON public.digital_signatures FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own signatures"
ON public.digital_signatures FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies for letter_verifications (public access for verification)
CREATE POLICY "Anyone can insert verification logs"
ON public.letter_verifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view verification logs"
ON public.letter_verifications FOR SELECT
USING (true);

-- RLS Policies for dispositions
CREATE POLICY "Users can view relevant dispositions"
ON public.dispositions FOR SELECT
TO authenticated
USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can insert dispositions"
ON public.dispositions FOR INSERT
TO authenticated
WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Recipients can update dispositions"
ON public.dispositions FOR UPDATE
TO authenticated
USING (to_user_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_institutions_updated_at
BEFORE UPDATE ON public.institutions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incoming_letters_updated_at
BEFORE UPDATE ON public.incoming_letters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_outgoing_letters_updated_at
BEFORE UPDATE ON public.outgoing_letters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dispositions_updated_at
BEFORE UPDATE ON public.dispositions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
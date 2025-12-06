-- Add position column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position text;

-- Add approved_by column to outgoing_letters for approval workflow
ALTER TABLE public.outgoing_letters ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Allow admins to view all profiles in their institution
CREATE POLICY "Institution admins can view institution profiles"
ON public.profiles
FOR SELECT
USING (
  institution_id = get_user_institution(auth.uid())
);

-- Allow admins to insert profiles for their institution
CREATE POLICY "Institution admins can create institution users"
ON public.profiles
FOR INSERT
WITH CHECK (
  institution_id = get_user_institution(auth.uid())
  AND has_role(auth.uid(), 'admin_instansi')
);

-- Allow admins to manage user roles for their institution
CREATE POLICY "Institution admins can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  institution_id = get_user_institution(auth.uid())
  AND has_role(auth.uid(), 'admin_instansi')
);
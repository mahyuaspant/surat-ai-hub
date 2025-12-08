-- Create storage bucket for letter files
INSERT INTO storage.buckets (id, name, public)
VALUES ('letters', 'letters', true);

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload letters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'letters');

-- Allow authenticated users to view files
CREATE POLICY "Authenticated users can view letters"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'letters');

-- Allow public to view signed letters (for verification)
CREATE POLICY "Public can view signed letters"
ON storage.objects FOR SELECT
USING (bucket_id = 'letters' AND (storage.foldername(name))[1] = 'signed');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own letter files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'letters');

-- Allow users to delete their own uploads  
CREATE POLICY "Users can delete own letter files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'letters');
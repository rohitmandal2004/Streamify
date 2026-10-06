-- STORAGE SECURITY APPLIED

-- Drop the dangerous public upload policy
DROP POLICY IF EXISTS "Allow public uploads to recordings" ON storage.objects;

-- We allow public SELECT (so users can download/play their recordings)
CREATE POLICY "Allow public select of recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings');

-- INSERTS are locked down. 
-- The backend generates a Signed Upload URL using the Service Role Key.
-- This bypasses RLS for the exact file specified, completely securing the bucket from abuse.

-- ═══════════════════════════════════════════════════════════════════════════
-- SANCTUARY OS — Documents Storage Policies
-- Version: 006
-- Purpose: RLS policies for the documents storage bucket
-- ═══════════════════════════════════════════════════════════════════════════

-- Authenticated users can upload documents
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Public read access for documents
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

-- Authenticated users can delete their own documents
CREATE POLICY "Authenticated users can delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents');

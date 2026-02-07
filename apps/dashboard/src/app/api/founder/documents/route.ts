// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY API — Founder Documents Endpoint
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/founder/documents
 * Get all documents for the founder's startup
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({
        success: true,
        documents: getMockDocuments(),
        isMock: true,
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        success: true,
        documents: getMockDocuments(),
        isMock: true,
      })
    }

    // Get user's startup_id
    const { data: profile } = await supabase
      .from('users')
      .select('startup_id')
      .eq('id', user.id)
      .single()

    if (!profile?.startup_id) {
      return NextResponse.json({
        success: true,
        documents: getMockDocuments(),
        isMock: true,
      })
    }

    // Get documents
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select(`
        id,
        name,
        type,
        file_url,
        file_size,
        mime_type,
        version,
        is_current,
        created_at,
        uploaded_by,
        users!documents_uploaded_by_fkey (name)
      `)
      .eq('startup_id', profile.startup_id)
      .eq('is_current', true)
      .order('created_at', { ascending: false })

    if (docsError) {
      console.error('Documents fetch error:', docsError)
      return NextResponse.json({
        success: true,
        documents: getMockDocuments(),
        isMock: true,
      })
    }

    const formattedDocs = (documents || []).map((doc: {
      id: string
      name: string
      type: string
      file_url: string
      file_size: number
      mime_type: string
      version: number
      created_at: string
      users?: { name: string } | null
    }) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      fileUrl: doc.file_url,
      size: formatFileSize(doc.file_size),
      mimeType: doc.mime_type,
      version: doc.version,
      uploadedAt: doc.created_at,
      uploadedBy: doc.users?.name || 'Unknown',
      shared: true, // TODO: Track sharing status
    }))

    return NextResponse.json({
      success: true,
      documents: formattedDocs,
      isMock: false,
    })
  } catch (error) {
    console.error('Founder documents API error:', error)
    return NextResponse.json({
      success: true,
      documents: getMockDocuments(),
      isMock: true,
    })
  }
}

/**
 * POST /api/founder/documents
 * Upload a new document
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's startup_id
    const { data: profile } = await supabase
      .from('users')
      .select('startup_id')
      .eq('id', user.id)
      .single()

    if (!profile?.startup_id) {
      return NextResponse.json({ error: 'No startup found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const docType = formData.get('type') as string || 'other'
    const docName = formData.get('name') as string || file.name

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${profile.startup_id}/${Date.now()}-${docName}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    // Mark previous versions as not current
    await supabase
      .from('documents')
      .update({ is_current: false })
      .eq('startup_id', profile.startup_id)
      .eq('name', docName)
      .eq('type', docType)

    // Get next version number
    const { data: versionData } = await supabase
      .from('documents')
      .select('version')
      .eq('startup_id', profile.startup_id)
      .eq('name', docName)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const nextVersion = (versionData?.version || 0) + 1

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        startup_id: profile.startup_id,
        uploaded_by: user.id,
        name: docName,
        type: docType,
        file_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        version: nextVersion,
        is_current: true,
      })
      .select()
      .single()

    if (docError) {
      console.error('Document record error:', docError)
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        fileUrl: document.file_url,
        size: formatFileSize(document.file_size),
        version: document.version,
        uploadedAt: document.created_at,
      },
    })
  } catch (error) {
    console.error('Upload document error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/founder/documents?id=xxx
 * Delete a document
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const docId = searchParams.get('id')

    if (!docId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Get user's startup_id
    const { data: profile } = await supabase
      .from('users')
      .select('startup_id')
      .eq('id', user.id)
      .single()

    if (!profile?.startup_id) {
      return NextResponse.json({ error: 'No startup found' }, { status: 404 })
    }

    // Verify document belongs to startup
    const { data: doc } = await supabase
      .from('documents')
      .select('id, file_url')
      .eq('id', docId)
      .eq('startup_id', profile.startup_id)
      .single()

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete from storage (extract path from URL)
    const urlParts = doc.file_url.split('/documents/')
    if (urlParts[1]) {
      await supabase.storage.from('documents').remove([urlParts[1]])
    }

    // Delete record
    await supabase.from('documents').delete().eq('id', docId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getMockDocuments() {
  return [
    {
      id: '1',
      name: 'Pitch Deck v3.pdf',
      type: 'pitch_deck',
      size: '2.4 MB',
      uploadedAt: '2026-01-28T10:00:00Z',
      shared: true,
    },
    {
      id: '2',
      name: 'Financial Model.xlsx',
      type: 'financials',
      size: '1.1 MB',
      uploadedAt: '2026-01-25T14:30:00Z',
      shared: false,
    },
    {
      id: '3',
      name: 'Product Roadmap.pdf',
      type: 'product',
      size: '890 KB',
      uploadedAt: '2026-01-20T09:15:00Z',
      shared: true,
    },
    {
      id: '4',
      name: 'Cap Table.xlsx',
      type: 'legal',
      size: '245 KB',
      uploadedAt: '2026-01-15T11:00:00Z',
      shared: false,
    },
  ]
}

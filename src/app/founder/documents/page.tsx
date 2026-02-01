'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'

// Mock documents for demo
const mockDocuments = [
  {
    id: 'doc-1',
    fileName: 'TechFlow AI - Pitch Deck Q1 2026.pdf',
    fileType: 'pitch_deck',
    fileSize: 2500000,
    uploadedAt: '2026-01-15T10:30:00Z',
    isSharedWithPartners: true,
  },
  {
    id: 'doc-2',
    fileName: 'Financial Model v2.xlsx',
    fileType: 'financials',
    fileSize: 450000,
    uploadedAt: '2026-01-10T14:20:00Z',
    isSharedWithPartners: true,
  },
  {
    id: 'doc-3',
    fileName: 'Product Roadmap 2026.pdf',
    fileType: 'other',
    fileSize: 1200000,
    uploadedAt: '2026-01-05T09:15:00Z',
    isSharedWithPartners: false,
  },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'pitch_deck':
      return 'slideshow'
    case 'financials':
      return 'table_chart'
    case 'legal':
      return 'gavel'
    default:
      return 'description'
  }
}

function getFileTypeLabel(fileType: string) {
  const labels: Record<string, string> = {
    pitch_deck: 'PITCH_DECK',
    financials: 'FINANCIALS',
    legal: 'LEGAL',
    other: 'DOCUMENT',
  }
  return labels[fileType] || 'DOCUMENT'
}

export default function FounderDocumentsPage() {
  const { data: session, status } = useSession()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--deep-black)]">
        <div className="animate-pulse text-[var(--cream)]/40 font-mono uppercase">LOADING...</div>
      </div>
    )
  }

  if (!session?.user) {
    redirect('/login')
  }

  const startupId = session.user.startupId

  if (!startupId) {
    redirect('/founder/dashboard')
  }

  return (
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <FounderHeader
        title="DOCUMENT_VAULT"
        breadcrumb={['Documents']}
      />

      {/* Upload Area */}
      <section className="border-b border-[var(--grid-line)] border-dashed p-10">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="size-20 border border-[var(--grid-line)] flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-[var(--cream)]/40">cloud_upload</span>
          </div>
          <h3 className="font-bold font-mono uppercase tracking-tight text-lg text-[var(--cream)] mb-2">
            UPLOAD_DOCUMENTS
          </h3>
          <p className="text-sm text-[var(--cream)]/60 mb-6 text-center">
            Drag and drop files here, or click to browse
          </p>
          <button className="bg-[var(--olive)] text-[var(--deep-black)] px-6 py-3 text-xs font-bold tracking-widest font-mono uppercase hover:bg-[var(--cream)] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">upload_file</span>
            CHOOSE_FILES
          </button>
          <p className="text-[10px] text-[var(--cream)]/40 mt-4 font-mono uppercase">
            SUPPORTED: PDF, DOCX, XLSX, PPTX (MAX 25MB)
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 border-b border-[var(--grid-line)]">
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)] mb-2">
            TOTAL_FILES
          </p>
          <p className="text-3xl font-black font-mono text-[var(--cream)]">{mockDocuments.length}</p>
        </div>
        <div className="p-6 border-r border-[var(--grid-line)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)] mb-2">
            SHARED
          </p>
          <p className="text-3xl font-black font-mono text-[var(--cream)]">
            {mockDocuments.filter(d => d.isSharedWithPartners).length}
          </p>
        </div>
        <div className="p-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--olive)] mb-2">
            TOTAL_SIZE
          </p>
          <p className="text-3xl font-black font-mono text-[var(--cream)]">
            {formatFileSize(mockDocuments.reduce((acc, d) => acc + d.fileSize, 0))}
          </p>
        </div>
      </section>

      {/* Documents List */}
      <div className="flex-1 overflow-auto">
        {mockDocuments.length > 0 ? (
          <div className="divide-y divide-[var(--grid-line)]">
            {mockDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-6 hover:bg-[#0a0a0a] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="size-14 border border-[var(--grid-line)] flex items-center justify-center">
                    <span className={`material-symbols-outlined text-2xl ${
                      doc.fileType === 'pitch_deck' ? 'text-amber-500' :
                      doc.fileType === 'financials' ? 'text-[var(--olive)]' :
                      'text-blue-500'
                    }`}>
                      {getFileIcon(doc.fileType)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold font-mono text-[var(--cream)] truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-[var(--cream)]/20 text-[var(--cream)]/60">
                        {getFileTypeLabel(doc.fileType)}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--cream)]/40">
                        {formatFileSize(doc.fileSize)}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--cream)]/40">
                        UPLOADED: {new Date(doc.uploadedAt).toLocaleDateString().toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc.isSharedWithPartners && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-[var(--olive)] text-[var(--olive)]">
                        SHARED
                      </span>
                    )}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenu(activeMenu === doc.id ? null : doc.id)}
                        className="size-8 border border-[var(--grid-line)] flex items-center justify-center text-[var(--cream)]/40 hover:text-[var(--cream)] hover:border-[var(--cream)]/40 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                      {activeMenu === doc.id && (
                        <div className="absolute right-0 top-10 w-48 bg-[var(--deep-black)] border border-[var(--grid-line)] z-10">
                          <button className="w-full text-left px-4 py-3 text-[10px] font-mono uppercase text-[var(--cream)]/60 hover:text-[var(--cream)] hover:bg-[#0a0a0a] transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">download</span>
                            DOWNLOAD
                          </button>
                          <button className="w-full text-left px-4 py-3 text-[10px] font-mono uppercase text-[var(--cream)]/60 hover:text-[var(--cream)] hover:bg-[#0a0a0a] transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">
                              {doc.isSharedWithPartners ? 'visibility_off' : 'visibility'}
                            </span>
                            {doc.isSharedWithPartners ? 'UNSHARE' : 'SHARE_WITH_PARTNERS'}
                          </button>
                          <button className="w-full text-left px-4 py-3 text-[10px] font-mono uppercase text-[var(--warning)] hover:bg-[#0a0a0a] transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">delete</span>
                            DELETE
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined text-5xl text-[var(--cream)]/20 mb-4">folder_open</span>
            <p className="text-[var(--cream)]/40 font-mono uppercase text-sm">NO_DOCUMENTS_UPLOADED</p>
            <p className="text-[10px] text-[var(--cream)]/20 font-mono uppercase mt-2">
              Upload your first document above
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <section className="border-t border-[var(--grid-line)] p-6">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-xl text-[var(--olive)]">info</span>
          <div className="text-[10px] font-mono text-[var(--cream)]/60 space-y-1">
            <p><span className="text-[var(--cream)]">PITCH_DECK:</span> UPLOAD YOUR LATEST INVESTOR PRESENTATION</p>
            <p><span className="text-[var(--cream)]">FINANCIALS:</span> KEEP YOUR FINANCIAL MODEL UP TO DATE FOR PARTNER REVIEWS</p>
            <p><span className="text-[var(--cream)]">SHARING:</span> DOCUMENTS MARKED AS &quot;SHARED&quot; ARE VISIBLE TO SANCTUARY PARTNERS</p>
          </div>
        </div>
      </section>
    </div>
  )
}

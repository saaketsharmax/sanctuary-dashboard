'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
  Toaster,
} from '@sanctuary/ui'
import { FileText, Upload, Download, Eye, Trash2, Share2, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
interface Document {
  id: string
  name: string
  type: string
  fileUrl?: string
  size: string
  mimeType?: string
  version?: number
  uploadedAt: string
  uploadedBy?: string
  shared: boolean
}

const documentTypes: Record<string, { label: string; color: string }> = {
  pitch_deck: { label: 'Pitch Deck', color: 'bg-blue-100 text-blue-700' },
  financials: { label: 'Financials', color: 'bg-green-100 text-green-700' },
  legal: { label: 'Legal', color: 'bg-purple-100 text-purple-700' },
  product: { label: 'Product', color: 'bg-orange-100 text-orange-700' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isMock, setIsMock] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/founder/documents')
      const data = await res.json()
      if (data.documents) {
        setDocuments(data.documents)
        setIsMock(data.isMock)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)
      formData.append('type', 'other')

      const res = await fetch('/api/founder/documents', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        toast.success('Document uploaded successfully')
        fetchDocuments()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to upload document')
      }
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const res = await fetch(`/api/founder/documents?id=${docId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Document deleted')
        setDocuments(documents.filter(d => d.id !== docId))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete document')
      }
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-12 mt-2" />
                <Skeleton className="h-4 w-16 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your startup documents
            {isMock && <Badge variant="outline" className="ml-2 text-xs">Demo Mode</Badge>}
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading || isMock}>
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>

      {/* Document Categories */}
      <div className="grid md:grid-cols-5 gap-4">
        {Object.entries(documentTypes).map(([key, { label, color }]) => {
          const count = documents.filter(d => d.type === key).length
          return (
            <Card key={key}>
              <CardContent className="pt-6">
                <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${color}`}>
                  {label}
                </div>
                <p className="text-2xl font-bold mt-2">{count}</p>
                <p className="text-sm text-muted-foreground">documents</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Documents</CardTitle>
          <CardDescription>Click on a document to view or download</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
              <p className="text-sm mt-1">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const typeInfo = documentTypes[doc.type] || documentTypes.other
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={`text-xs ${typeInfo.color}`}>
                            {typeInfo.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{doc.size}</span>
                          <span className="text-xs text-muted-foreground">• {formatDate(doc.uploadedAt)}</span>
                          {doc.version && doc.version > 1 && (
                            <span className="text-xs text-muted-foreground">• v{doc.version}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.shared && (
                        <Badge variant="outline" className="text-xs">
                          <Share2 className="h-3 w-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                      {doc.fileUrl && (
                        <>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.fileUrl} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(doc.id)}
                        disabled={isMock}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}

import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Upload,
  Download,
  Trash2,
  File,
  FileSpreadsheet,
  Presentation,
  MoreVertical,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
      return <Presentation className="h-8 w-8 text-orange-500" />
    case 'financials':
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />
    default:
      return <File className="h-8 w-8 text-blue-500" />
  }
}

function getFileTypeBadge(fileType: string) {
  const labels: Record<string, string> = {
    pitch_deck: 'Pitch Deck',
    financials: 'Financials',
    legal: 'Legal',
    other: 'Document',
  }
  return labels[fileType] || 'Document'
}

export default async function FounderDocumentsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const startupId = session.user.startupId

  if (!startupId) {
    redirect('/founder/dashboard')
  }

  return (
    <div className="flex flex-col">
      <FounderHeader
        title="Documents"
        description="Upload and manage your startup documents"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Upload Area */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Upload Documents</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Drag and drop files here, or click to browse
            </p>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Supported: PDF, DOCX, XLSX, PPTX (max 25MB)
            </p>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              {mockDocuments.length} documents uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  {getFileIcon(doc.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {getFileTypeBadge(doc.fileType)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(doc.fileSize)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.isSharedWithPartners && (
                      <Badge variant="outline" className="text-xs">
                        Shared
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          {doc.isSharedWithPartners ? 'Unshare' : 'Share with Partners'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {mockDocuments.length === 0 && (
              <div className="text-center py-10">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No documents uploaded yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-lg">Document Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Pitch Deck:</strong> Upload your latest investor presentation
            </p>
            <p>
              <strong>Financials:</strong> Keep your financial model up to date for partner reviews
            </p>
            <p>
              <strong>Sharing:</strong> Documents marked as &quot;Shared&quot; are visible to Sanctuary partners
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

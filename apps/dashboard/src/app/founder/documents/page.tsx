'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, Download, Eye, Trash2, Share2 } from 'lucide-react'
import { useState } from 'react'

const mockDocuments = [
  { id: '1', name: 'Pitch Deck v3.pdf', type: 'pitch_deck', size: '2.4 MB', uploadedAt: '2026-01-28', shared: true },
  { id: '2', name: 'Financial Model.xlsx', type: 'financials', size: '1.1 MB', uploadedAt: '2026-01-25', shared: true },
  { id: '3', name: 'Cap Table.xlsx', type: 'legal', size: '245 KB', uploadedAt: '2026-01-20', shared: false },
  { id: '4', name: 'Product Roadmap.pdf', type: 'other', size: '890 KB', uploadedAt: '2026-01-15', shared: false },
]

const documentTypes: Record<string, { label: string; color: string }> = {
  pitch_deck: { label: 'Pitch Deck', color: 'bg-blue-100 text-blue-700' },
  financials: { label: 'Financials', color: 'bg-green-100 text-green-700' },
  legal: { label: 'Legal', color: 'bg-purple-100 text-purple-700' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
}

export default function DocumentsPage() {
  const [documents] = useState(mockDocuments)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">Upload and manage your startup documents</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Document Categories */}
      <div className="grid md:grid-cols-4 gap-4">
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
          <div className="space-y-3">
            {documents.map((doc) => (
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
                      <Badge variant="secondary" className="text-xs">
                        {documentTypes[doc.type].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{doc.size}</span>
                      <span className="text-xs text-muted-foreground">• {doc.uploadedAt}</span>
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
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

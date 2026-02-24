'use client'

import { FileText, Upload, Eye, Share2, Download, MoreVertical, MoreHorizontal, Plus, File, Image, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

interface Document {
  id: string
  name: string
  type: 'PDF' | 'Excel' | 'Image' | 'Text'
  size: string
  uploadedAt: string
  shared: boolean
  description?: string
  tags?: string[]
  lastModified: Date
}

const documents: Document[] = [
  {
    id: '1',
    name: 'Pitch Deck v3.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadedAt: '2 days ago',
    shared: true,
    description: 'Updated investor pitch deck with Q1 2025 traction metrics and revised market sizing',
    tags: ['fundraising', 'investor'],
    lastModified: new Date('2025-03-07')
  },
  {
    id: '2',
    name: 'Financial Model Q1.xlsx',
    type: 'Excel',
    size: '450 KB',
    uploadedAt: '5 days ago',
    shared: true,
    description: 'Comprehensive financial projections including revenue forecasts and burn rate analysis',
    tags: ['finance', 'planning'],
    lastModified: new Date('2025-03-04')
  },
  {
    id: '3',
    name: 'User Research Summary.pdf',
    type: 'PDF',
    size: '1.8 MB',
    uploadedAt: '1 week ago',
    shared: false,
    description: 'Key insights from 25 user interviews conducted in February 2025',
    tags: ['research', 'product'],
    lastModified: new Date('2025-03-02')
  },
  {
    id: '4',
    name: 'Product Roadmap 2026.pdf',
    type: 'PDF',
    size: '890 KB',
    uploadedAt: '2 weeks ago',
    shared: true,
    description: 'Strategic product roadmap outlining feature releases for the next 12 months',
    tags: ['product', 'strategy'],
    lastModified: new Date('2025-02-25')
  },
]

const getDocumentIcon = (type: string) => {
  const icons = {
    PDF: FileText,
    Excel: FileSpreadsheet,
    Image: Image,
    Text: File,
  }
  return icons[type as keyof typeof icons] || File
}

const getDocumentColor = (type: string) => {
  const colors = {
    PDF: 'from-red-100 to-red-200',
    Excel: 'from-green-100 to-green-200',
    Image: 'from-blue-100 to-blue-200',
    Text: 'from-gray-100 to-gray-200',
  }
  return colors[type as keyof typeof colors] || colors.Text
}

export function FounderDocumentsContent() {
  const [docs] = useState<Document[]>(documents)
  const hasDocuments = docs.length > 0

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-8 py-5 bg-card border-b border-border/30">
        <h1 className="text-lg font-semibold text-foreground">Documents</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="space-y-0">
            {docs.map((doc, index) => {
              const IconComponent = getDocumentIcon(doc.type)
              return (
                <div
                  key={doc.id}
                  className={`py-5 hover:bg-muted/50 transition-colors cursor-pointer group ${
                    index !== docs.length - 1 ? 'border-b border-border/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground mb-1">{doc.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{doc.type}</span>
                        <span>·</span>
                        <span>{doc.size}</span>
                        <span>·</span>
                        <span>{doc.uploadedAt}</span>
                        {doc.shared && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-green-600">
                              <Share2 className="w-3 h-3" />
                              Shared
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      {doc.tags && doc.tags.map((tag, idx) => (
                        <Badge key={idx} className="capitalize text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

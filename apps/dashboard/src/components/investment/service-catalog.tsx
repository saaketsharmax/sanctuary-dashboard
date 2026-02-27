'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import {
  CREDIT_CATEGORIES,
  CREDIT_SERVICES,
  type CreditService,
  type CreditCategory,
} from '@/types'

interface ServiceCatalogProps {
  onSelectService: (service: CreditService) => void
}

export function ServiceCatalog({ onSelectService }: ServiceCatalogProps) {
  const [activeTab, setActiveTab] = useState<CreditCategory>('space')

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Service Catalog</h2>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Browse available services and click to request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CreditCategory)}>
            <TabsList>
              {CREDIT_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CREDIT_CATEGORIES.map((cat) => {
              const services = CREDIT_SERVICES.filter((s) => s.category === cat.value)
              return (
                <TabsContent key={cat.value} value={cat.value}>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => onSelectService(service)}
                        className="text-left rounded-lg border p-4 hover:border-primary hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-sm">{service.name}</h3>
                          <span className="text-xs font-semibold text-primary whitespace-nowrap">
                            {service.priceRange}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

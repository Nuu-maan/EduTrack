"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function KpiCard({
  title,
  value,
  icon,
  sub,
  action,
  className,
}: {
  title: string
  value: string | number
  icon?: React.ReactNode
  sub?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <Card
      className={cn(
        "bg-card/60 border-border/60 backdrop-blur-sm transition hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold">{value}</div>
          {icon ? <span className="rounded-md bg-primary/10 p-2 text-primary">{icon}</span> : null}
        </div>
        {action ? <div className="mt-3">{action}</div> : null}
      </CardContent>
      {sub ? <div className="px-4 pb-3 text-xs text-muted-foreground">{sub}</div> : null}
    </Card>
  )
}

"use client"

import { useParams } from 'next/navigation'
import CashFlow from '@/components/CashFlow'

export default function CashFlowPage() {
  const params = useParams()
  const id = params.id as string

  return <CashFlow projectId={id} />
}
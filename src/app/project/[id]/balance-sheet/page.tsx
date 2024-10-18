"use client"

import { useParams } from 'next/navigation'
import BalanceSheet from '@/components/BalanceSheet'

export default function BalanceSheetPage() {
  const params = useParams()
  const id = params.id as string

  return <BalanceSheet projectId={id} />
}
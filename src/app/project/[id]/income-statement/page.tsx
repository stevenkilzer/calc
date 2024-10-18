"use client"

import { useParams } from 'next/navigation'
import IncomeStatement from '@/components/IncomeStatement'

export default function IncomeStatementPage() {
  const params = useParams()
  const id = params.id as string

  return <IncomeStatement projectId={id} />
}
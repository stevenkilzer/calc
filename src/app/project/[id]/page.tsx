"use client"

import { useParams } from 'next/navigation'
import { BusinessCalculator } from '@/components/BusinessCalculator'
import BalanceSheet from '@/components/BalanceSheet'
import CashFlow from '@/components/CashFlow'
import IncomeStatement from '@/components/IncomeStatement'
import LoadDetails from '@/components/LoadDetails'

export default function ProjectPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div>
      <h1>Project Overview - {id}</h1>
      <BusinessCalculator projectId={id} />
      <BalanceSheet projectId={id} />
      <CashFlow projectId={id} />
      <IncomeStatement projectId={id} />
      <LoadDetails projectId={id} />
    </div>
  )
}
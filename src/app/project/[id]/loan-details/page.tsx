"use client"

import { useParams } from 'next/navigation'
import LoanDetails from '@/components/LoanDetails'

export default function LoanDetailsPage() {
  const params = useParams()
  const id = params.id as string

  return <LoanDetails projectId={id} />
}
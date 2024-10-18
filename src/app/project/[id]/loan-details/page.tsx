"use client"

import { useParams } from 'next/navigation'
import LoadDetails from '@/components/LoadDetails'

export default function LoadDetailsPage() {
  const params = useParams()
  const id = params.id as string

  return <LoadDetails projectId={id} />
}
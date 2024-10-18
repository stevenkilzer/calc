"use client"

import { useParams } from 'next/navigation'
import ProjectOverview from '@/components/ProjectOverview'

export default function ProjectOverviewPage() {
  const params = useParams()
  const id = params.id as string

  return <ProjectOverview projectId={id} />
}
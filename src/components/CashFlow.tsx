import React from 'react'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const CashFlow = ({ projectId }: { projectId: string }) => {
  const { projects } = useProject()
  const project = projects.find(p => p.id === projectId)

  if (!project) return <div>Project not found</div>

  // Assuming project.data contains the necessary financial information
  const { operatingActivities, investingActivities, financingActivities } = project.data || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Statement - {project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} className="font-bold">Operating Activities</TableCell>
            </TableRow>
            {/* Render operating activities here */}
            <TableRow>
              <TableCell colSpan={2} className="font-bold">Investing Activities</TableCell>
            </TableRow>
            {/* Render investing activities here */}
            <TableRow>
              <TableCell colSpan={2} className="font-bold">Financing Activities</TableCell>
            </TableRow>
            {/* Render financing activities here */}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default CashFlow
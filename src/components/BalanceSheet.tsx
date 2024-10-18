import React from 'react'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const BalanceSheet = ({ projectId }: { projectId: string }) => {
  const { projects } = useProject()
  const project = projects.find(p => p.id === projectId)

  if (!project) return <div>Project not found</div>

  // Assuming project.data contains the necessary financial information
  const { assets, liabilities, equity } = project.data || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Sheet - {project.name}</CardTitle>
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
              <TableCell colSpan={2} className="font-bold">Assets</TableCell>
            </TableRow>
            {/* Render asset items here */}
            <TableRow>
              <TableCell colSpan={2} className="font-bold">Liabilities</TableCell>
            </TableRow>
            {/* Render liability items here */}
            <TableRow>
              <TableCell colSpan={2} className="font-bold">Equity</TableCell>
            </TableRow>
            {/* Render equity items here */}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default BalanceSheet
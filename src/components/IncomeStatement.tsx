import React from 'react'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const IncomeStatement = ({ projectId }: { projectId: string }) => {
  const { projects } = useProject()
  const project = projects.find(p => p.id === projectId)

  if (!project) return <div>Project not found</div>

  // Assuming project.data contains the necessary financial information
  const { revenue, expenses, netIncome } = project.data || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Statement - {project.name}</CardTitle>
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
              <TableCell>Revenue</TableCell>
              <TableCell>{revenue}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Expenses</TableCell>
              <TableCell>{expenses}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Net Income</TableCell>
              <TableCell className="font-bold">{netIncome}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default IncomeStatement
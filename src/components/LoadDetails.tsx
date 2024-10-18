"use client"

import React from 'react'
import { useProject } from './ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const LoadDetails = ({ projectId }: { projectId: string }) => {
  const { projects } = useProject()
  const project = projects.find(p => p.id === projectId)

  if (!project) return <div>Project not found</div>

  const { loanAmount, interestRate, loanTerm } = project.data || {
    loanAmount: 0,
    interestRate: 0,
    loanTerm: 0
  }

  const monthlyInterestRate = interestRate / 12 / 100
  const numberOfPayments = loanTerm * 12
  const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Details - {project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Loan Amount</TableCell>
              <TableCell>${loanAmount.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Interest Rate</TableCell>
              <TableCell>{interestRate}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Loan Term</TableCell>
              <TableCell>{loanTerm} years</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Monthly Payment</TableCell>
              <TableCell>${isNaN(monthlyPayment) ? 'N/A' : monthlyPayment.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default LoadDetails
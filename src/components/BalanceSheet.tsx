"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils"
import { FormattedNumberInput } from '@/components/FormattedNumberInput'
import { calculateFinancials, FinancialData } from '@/lib/financialCalculations'

type BalanceSheetData = FinancialData['balanceSheet']

const defaultData: BalanceSheetData = {
  revenue: { ecommerce: 0, wholesale: 0 },
  cogs: 0,
  selling: 0,
  marketing: 0,
  coreOverhead: 0,
}

export default function BalanceSheetPage() {
  const params = useParams()
  const id = params.id as string
  const { projects, updateProjectData } = useProject()
  const project = projects.find(p => p.id === id)

  const [data, setData] = useState<BalanceSheetData>(defaultData)

  useEffect(() => {
    if (project && project.data && project.data.balanceSheet) {
      setData(project.data.balanceSheet)
    }
  }, [project])

  const handleInputChange = (
    field: keyof BalanceSheetData,
    subfield: keyof BalanceSheetData['revenue'] | null,
    value: number
  ) => {
    setData(prevData => {
      if (field === 'revenue' && subfield) {
        return {
          ...prevData,
          revenue: {
            ...prevData.revenue,
            [subfield]: value
          }
        }
      } else {
        return {
          ...prevData,
          [field]: value
        }
      }
    })
  }

  const handleSave = () => {
    if (project) {
      updateProjectData(id, { ...project.data, balanceSheet: data })
    }
  }

  const financials = calculateFinancials({
    balanceSheet: data,
    loanDetails: project?.data?.loanDetails || { loanAmount: 0, interestRate: 0, loanTerm: 0 },
    cashFlow: project?.data?.cashFlow || { operating: 0, investing: 0, financing: 0 },
  })

  const renderRow = (label: string, value: number, isInput: boolean = false, field: keyof BalanceSheetData, subfield: keyof BalanceSheetData['revenue'] | null = null, isTotal: boolean = false) => (
    <TableRow className={isTotal ? "bg-muted" : ""}>
      <TableCell className={`font-medium ${isTotal ? "" : "pl-4"}`}>{label}</TableCell>
      <TableCell>
        {isInput ? (
          <FormattedNumberInput
            value={value}
            onChange={(newValue) => handleInputChange(field, subfield, newValue)}
            className="w-full"
          />
        ) : (
          `$${formatNumber(value)}`
        )}
      </TableCell>
      <TableCell>{financials.netRevenue !== 0 ? `${formatNumber((value / financials.netRevenue) * 100, 1)}%` : 'N/A'}</TableCell>
    </TableRow>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Balance Sheet - {project?.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Financial Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Item</TableHead>
                <TableHead>This Year</TableHead>
                <TableHead>% of Net Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Revenue</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
              {renderRow("E-commerce", data.revenue.ecommerce, true, 'revenue', 'ecommerce')}
              {renderRow("Wholesale", data.revenue.wholesale, true, 'revenue', 'wholesale')}
              {renderRow("Net Revenue", financials.netRevenue, false, 'revenue', null, true)}
              {renderRow("COGs", data.cogs, true, 'cogs')}
              {renderRow("Gross Profit", financials.grossProfit, false, 'revenue', null, true)}
              <TableRow>
                <TableCell className="pl-4 italic">Gross Margin</TableCell>
                <TableCell colSpan={2}>{formatNumber(financials.grossMargin, 1)}%</TableCell>
              </TableRow>
              {renderRow("Selling", data.selling, true, 'selling')}
              {renderRow("Marketing", data.marketing, true, 'marketing')}
              {renderRow("Contribution Profit", financials.contributionProfit, false, 'revenue', null, true)}
              <TableRow>
                <TableCell className="pl-4 italic">Contribution Margin</TableCell>
                <TableCell colSpan={2}>{formatNumber(financials.contributionMargin, 1)}%</TableCell>
              </TableRow>
              {renderRow("Core Overhead", data.coreOverhead, true, 'coreOverhead')}
              {renderRow("Operating Income", financials.operatingIncome, false, 'revenue', null, true)}
              <TableRow>
                <TableCell className="pl-4 italic">Operating Margin</TableCell>
                <TableCell colSpan={2}>{formatNumber(financials.operatingMargin, 1)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4">
            <Button onClick={handleSave}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
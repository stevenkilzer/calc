"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils"

type BalanceSheetData = {
  revenue: { ecommerce: number; wholesale: number; }
  cogs: number;
  selling: number;
  marketing: number;
  coreOverhead: number;
}

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

  const handleInputChange = (field: keyof BalanceSheetData, subfield: string | null, value: number) => {
    setData(prevData => {
      if (subfield) {
        return {
          ...prevData,
          [field]: {
            ...prevData[field as keyof BalanceSheetData],
            [subfield]: value
          }
        }
      }
      return { ...prevData, [field]: value }
    })
  }

  const handleSave = () => {
    if (project) {
      updateProjectData(id, { ...project.data, balanceSheet: data })
    }
  }

  // Calculations
  const netRevenue = data.revenue.ecommerce + data.revenue.wholesale
  const grossProfit = netRevenue - data.cogs
  const grossMargin = netRevenue !== 0 ? (grossProfit / netRevenue) * 100 : 0
  const contributionProfit = grossProfit - data.selling - data.marketing
  const contributionMargin = netRevenue !== 0 ? (contributionProfit / netRevenue) * 100 : 0
  const operatingIncome = contributionProfit - data.coreOverhead
  const operatingMargin = netRevenue !== 0 ? (operatingIncome / netRevenue) * 100 : 0

  const renderRow = (label: string, value: number, isInput: boolean = false, field: string, subfield: string | null = null, isTotal: boolean = false) => (
    <TableRow className={isTotal ? "bg-muted" : ""}>
      <TableCell className={`font-medium ${isTotal ? "" : "pl-4"}`}>{label}</TableCell>
      <TableCell>
        {isInput ? (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field, subfield, Number(e.target.value))}
            className="w-full"
          />
        ) : (
          `$${formatNumber(value)}`
        )}
      </TableCell>
      <TableCell>{netRevenue !== 0 ? `${formatNumber((value / netRevenue) * 100, 1)}%` : 'N/A'}</TableCell>
    </TableRow>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Balance Sheet - {project?.name}</h1>
      <Card className="mb-4">
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
              {renderRow("Net Revenue", netRevenue, false, '', null, true)}
              {renderRow("COGs", data.cogs, true, 'cogs')}
              {renderRow("Gross Profit", grossProfit, false, '', null, true)}
              <TableRow>
                <TableCell className="pl-4 italic">Gross Margin</TableCell>
                <TableCell colSpan={2}>{formatNumber(grossMargin, 1)}%</TableCell>
              </TableRow>
              {renderRow("Selling", data.selling, true, 'selling')}
              {renderRow("Marketing", data.marketing, true, 'marketing')}
              {renderRow("Contribution Profit", contributionProfit, false, '', null, true)}
              <TableRow>
                <TableCell className="pl-4 italic">Contribution Margin</TableCell>
                <TableCell colSpan={2}>{formatNumber(contributionMargin, 1)}%</TableCell>
              </TableRow>
              {renderRow("Core Overhead", data.coreOverhead, true, 'coreOverhead')}
              {renderRow("Operating Income", operatingIncome, false, '', null, true)}
              <TableRow>
                <TableCell className="pl-4 italic">Operating Margin</TableCell>
                <TableCell colSpan={2}>{formatNumber(operatingMargin, 1)}%</TableCell>
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
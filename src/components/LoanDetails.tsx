"use client"

import React, { useState, useEffect } from 'react'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type LoanData = {
  isBusinessPurchase: boolean;
  purchasePrice: number;
  downPayment: number;
  thirdPartyInvestment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
}

const LoanDetails: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { projects, updateProjectData } = useProject()
  const project = projects.find(p => p.id === projectId)

  const [data, setData] = useState<LoanData>({
    isBusinessPurchase: false,
    purchasePrice: 0,
    downPayment: 0,
    thirdPartyInvestment: 0,
    loanAmount: 0,
    interestRate: 0,
    loanTerm: 0,
  })

  useEffect(() => {
    if (project && project.data && project.data.loanDetails) {
      setData(project.data.loanDetails)
    }
  }, [project])

  const handleInputChange = (field: keyof LoanData, value: number | boolean) => {
    setData(prevData => ({ ...prevData, [field]: value }))
  }

  const handleSave = () => {
    if (project) {
      updateProjectData(projectId, { ...project.data, loanDetails: data })
    }
  }

  // Calculations
  const calculatedLoanAmount = data.isBusinessPurchase
    ? data.purchasePrice - data.downPayment - data.thirdPartyInvestment
    : data.loanAmount

  const monthlyInterestRate = data.interestRate / 12 / 100
  const numberOfPayments = data.loanTerm * 12
  const monthlyPayment = calculatedLoanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)

  // Calculate amortization schedule
  const calculateAmortizationSchedule = () => {
    let remainingBalance = calculatedLoanAmount
    let totalPrincipalPaid = 0
    let totalInterestPaid = 0
    let totalPaid = 0
    const schedule = []

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remainingBalance * monthlyInterestRate
      const principalPayment = monthlyPayment - interestPayment
      remainingBalance -= principalPayment
      totalPrincipalPaid += principalPayment
      totalInterestPaid += interestPayment
      totalPaid += monthlyPayment

      if (month % 12 === 0 || month === 1 || month === numberOfPayments) {
        schedule.push({
          month,
          remainingBalance,
          totalPrincipalPaid,
          totalInterestPaid,
          totalPaid
        })
      }
    }

    return schedule
  }

  const amortizationSchedule = calculateAmortizationSchedule()

  const renderRow = (label: string, value: string | number, percentage: number | null = null, inputProps?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <TableRow>
      <TableCell className="font-medium">{label}</TableCell>
      <TableCell>
        {inputProps ? (
          <Input
            type="number"
            {...inputProps}
          />
        ) : (
          typeof value === 'number' ? `$${formatNumber(value)}` : value
        )}
      </TableCell>
      {percentage !== null && (
        <TableCell>{formatNumber(percentage, 1)}%</TableCell>
      )}
    </TableRow>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Loan Details - {project?.name}</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Loan Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <Switch
              id="loan-type"
              checked={data.isBusinessPurchase}
              onCheckedChange={(checked) => handleInputChange('isBusinessPurchase', checked)}
            />
            <Label htmlFor="loan-type">Business Purchase Loan</Label>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Item</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>% of Loan Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.isBusinessPurchase && (
                <>
                  {renderRow("Purchase Price", data.purchasePrice, null, {
                    value: data.purchasePrice,
                    onChange: (e) => handleInputChange('purchasePrice', Number(e.target.value))
                  })}
                  {renderRow("Down Payment", data.downPayment, (data.downPayment / data.purchasePrice) * 100, {
                    value: data.downPayment,
                    onChange: (e) => handleInputChange('downPayment', Number(e.target.value))
                  })}
                  {renderRow("3rd Party Investment", data.thirdPartyInvestment, (data.thirdPartyInvestment / data.purchasePrice) * 100, {
                    value: data.thirdPartyInvestment,
                    onChange: (e) => handleInputChange('thirdPartyInvestment', Number(e.target.value))
                  })}
                </>
              )}
              {renderRow("Loan Amount", 
                data.isBusinessPurchase ? calculatedLoanAmount : data.loanAmount,
                null,
                !data.isBusinessPurchase ? {
                  value: data.loanAmount,
                  onChange: (e) => handleInputChange('loanAmount', Number(e.target.value))
                } : undefined
              )}
              {renderRow("Interest Rate (%)", data.interestRate, null, {
                value: data.interestRate,
                onChange: (e) => handleInputChange('interestRate', Number(e.target.value))
              })}
              {renderRow("Loan Term (years)", data.loanTerm, null, {
                value: data.loanTerm,
                onChange: (e) => handleInputChange('loanTerm', Number(e.target.value))
              })}
              {renderRow("Monthly Payment", isNaN(monthlyPayment) ? 'N/A' : monthlyPayment, null)}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Button onClick={handleSave}>Save</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Amortization Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={amortizationSchedule}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottomRight', offset: -10 }} />
              <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => ['$' + formatNumber(value, 2)]}
                labelFormatter={(label: number) => `Month ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="remainingBalance" name="Remaining Balance" stroke="#8884d8" />
              <Line type="monotone" dataKey="totalPrincipalPaid" name="Total Principal Paid" stroke="#82ca9d" />
              <Line type="monotone" dataKey="totalInterestPaid" name="Total Interest Paid" stroke="#ffc658" />
              <Line type="monotone" dataKey="totalPaid" name="Total Paid" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loan Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {renderRow("Total Principal", formatNumber(calculatedLoanAmount))}
              {amortizationSchedule.length > 0 ? (
                <>
                  {renderRow("Total Interest", formatNumber(amortizationSchedule[amortizationSchedule.length - 1].totalInterestPaid))}
                  {renderRow("Total Paid", formatNumber(amortizationSchedule[amortizationSchedule.length - 1].totalPaid))}
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>Unable to calculate loan summary. Please ensure all loan details are entered correctly.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoanDetails
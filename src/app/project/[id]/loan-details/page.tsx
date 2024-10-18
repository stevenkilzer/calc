"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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

export default function LoanDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const { projects, updateProjectData } = useProject()
  const project = projects.find(p => p.id === id)

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
      updateProjectData(id, { ...project.data, loanDetails: data })
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
    const monthlyInterestRate = data.interestRate / 12 / 100
    const numberOfPayments = data.loanTerm * 12
    const monthlyPayment = calculatedLoanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)

    let remainingBalance = calculatedLoanAmount
    let totalInterest = 0
    const schedule = []

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remainingBalance * monthlyInterestRate
      const principalPayment = monthlyPayment - interestPayment
      remainingBalance -= principalPayment
      totalInterest += interestPayment

      if (month % 12 === 0 || month === 1 || month === numberOfPayments) {
        schedule.push({
          month,
          remainingBalance,
          totalInterest,
          cumulativeProfit: totalInterest - calculatedLoanAmount + remainingBalance
        })
      }
    }

    return schedule
  }

  const amortizationSchedule = calculateAmortizationSchedule()

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
            <TableBody>
              {data.isBusinessPurchase && (
                <>
                  <TableRow>
                    <TableCell className="font-medium">Purchase Price</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={data.purchasePrice}
                        onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Down Payment</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={data.downPayment}
                        onChange={(e) => handleInputChange('downPayment', Number(e.target.value))}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">3rd Party Investment</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={data.thirdPartyInvestment}
                        onChange={(e) => handleInputChange('thirdPartyInvestment', Number(e.target.value))}
                      />
                    </TableCell>
                  </TableRow>
                </>
              )}
              <TableRow>
                <TableCell className="font-medium">Loan Amount</TableCell>
                <TableCell>
                  {data.isBusinessPurchase ? (
                    `$${formatNumber(calculatedLoanAmount)}`
                  ) : (
                    <Input
                      type="number"
                      value={data.loanAmount}
                      onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                    />
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Interest Rate (%)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.interestRate}
                    onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Loan Term (years)</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={data.loanTerm}
                    onChange={(e) => handleInputChange('loanTerm', Number(e.target.value))}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Monthly Payment</TableCell>
                <TableCell>${isNaN(monthlyPayment) ? 'N/A' : formatNumber(monthlyPayment)}</TableCell>
              </TableRow>
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
              <Line type="monotone" dataKey="totalInterest" name="Total Interest" stroke="#82ca9d" />
              <Line type="monotone" dataKey="cumulativeProfit" name="Cumulative Profit" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
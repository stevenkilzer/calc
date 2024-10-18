import React, { useState } from 'react'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { formatNumber } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

const ProjectOverview: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { projects } = useProject()
  const project = projects.find(p => p.id === projectId)

  const [showLoanBalance, setShowLoanBalance] = useState(true)
  const [showCumulativeProfit, setShowCumulativeProfit] = useState(true)
  const [showTotalValue, setShowTotalValue] = useState(true)
  const [showCashFlow, setShowCashFlow] = useState(true)
  const [isAnnualView, setIsAnnualView] = useState(false)

  if (!project) return <div>Project not found</div>

  const balanceSheet = project.data?.balanceSheet || {}
  const loanDetails = project.data?.loanDetails || {}
  const cashFlow = project.data?.cashFlow || {}

  // Balance Sheet Calculations
  const netRevenue = (balanceSheet.revenue?.ecommerce || 0) + (balanceSheet.revenue?.wholesale || 0)
  const grossProfit = netRevenue - (balanceSheet.cogs || 0)
  const grossMargin = (grossProfit / netRevenue) * 100
  const operatingIncome = grossProfit - (balanceSheet.selling || 0) - (balanceSheet.marketing || 0) - (balanceSheet.coreOverhead || 0)
  const operatingMargin = (operatingIncome / netRevenue) * 100

  // Loan Calculations
  const loanAmount = loanDetails.isBusinessPurchase
    ? (loanDetails.purchasePrice || 0) - (loanDetails.downPayment || 0) - (loanDetails.thirdPartyInvestment || 0)
    : loanDetails.loanAmount || 0
  const monthlyInterestRate = (loanDetails.interestRate || 0) / 12 / 100
  const numberOfPayments = (loanDetails.loanTerm || 0) * 12
  const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)

  // Cash Flow Calculations
  const totalOperatingCashFlow = Object.values(cashFlow.operatingActivities || {}).reduce((sum, value) => sum + (value as number), 0)
  const totalInvestingCashFlow = Object.values(cashFlow.investingActivities || {}).reduce((sum, value) => sum + (value as number), 0)
  const totalFinancingCashFlow = Object.values(cashFlow.financingActivities || {}).reduce((sum, value) => sum + (value as number), 0)
  const netCashFlow = totalOperatingCashFlow + totalInvestingCashFlow + totalFinancingCashFlow

  // Calculate combined schedule
  const calculateCombinedSchedule = () => {
    let remainingBalance = loanAmount
    let totalInterest = 0
    let cumulativeProfit = 0
    let cumulativeCashFlow = 0
    const schedule = []
    let breakEvenMonth = null

    for (let month = 1; month <= Math.max(120, numberOfPayments); month++) {
      // Loan calculations
      if (month <= numberOfPayments) {
        const interestPayment = remainingBalance * monthlyInterestRate
        const principalPayment = monthlyPayment - interestPayment
        remainingBalance -= principalPayment
        totalInterest += interestPayment
      }

      // Profit and Cash Flow calculations
      const monthlyProfit = operatingIncome / 12
      const monthlyCashFlow = netCashFlow / 12
      cumulativeProfit += monthlyProfit
      cumulativeCashFlow += monthlyCashFlow

      const totalValue = cumulativeProfit - loanAmount + (loanAmount - remainingBalance)

      if (totalValue >= 0 && breakEvenMonth === null) {
        breakEvenMonth = month
      }

      if (!isAnnualView || month % 12 === 0 || month === 1 || month === numberOfPayments || month === breakEvenMonth) {
        schedule.push({
          month,
          remainingBalance,
          cumulativeProfit,
          totalValue,
          cumulativeCashFlow
        })
      }
    }

    return { schedule, breakEvenMonth }
  }

  const { schedule, breakEvenMonth } = calculateCombinedSchedule()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Project Overview - {project.name}</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Net Revenue</TableCell>
                <TableCell>${formatNumber(netRevenue)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Gross Profit</TableCell>
                <TableCell>${formatNumber(grossProfit)} ({formatNumber(grossMargin, 1)}%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Operating Income</TableCell>
                <TableCell>${formatNumber(operatingIncome)} ({formatNumber(operatingMargin, 1)}%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Loan Amount</TableCell>
                <TableCell>${formatNumber(loanAmount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Monthly Loan Payment</TableCell>
                <TableCell>${isNaN(monthlyPayment) ? 'N/A' : formatNumber(monthlyPayment)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Net Cash Flow</TableCell>
                <TableCell>${formatNumber(netCashFlow)}</TableCell>
              </TableRow>
              {breakEvenMonth && (
                <TableRow>
                  <TableCell className="font-medium">Break-even Point</TableCell>
                  <TableCell>{breakEvenMonth} months</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Profit, Cash Flow, and Loan Amortization Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Switch id="loan-balance" checked={showLoanBalance} onCheckedChange={setShowLoanBalance} />
              <Label htmlFor="loan-balance">Show Loan Balance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="cumulative-profit" checked={showCumulativeProfit} onCheckedChange={setShowCumulativeProfit} />
              <Label htmlFor="cumulative-profit">Show Cumulative Profit</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="total-value" checked={showTotalValue} onCheckedChange={setShowTotalValue} />
              <Label htmlFor="total-value">Show Total Value</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="cash-flow" checked={showCashFlow} onCheckedChange={setShowCashFlow} />
              <Label htmlFor="cash-flow">Show Cash Flow</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="annual-view" checked={isAnnualView} onCheckedChange={setIsAnnualView} />
              <Label htmlFor="annual-view">Annual View</Label>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={600}>
            <LineChart
              data={schedule}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: isAnnualView ? 'Year' : 'Month', position: 'insideBottomRight', offset: -10 }}
                tickFormatter={(value) => isAnnualView ? Math.ceil(value / 12).toString() : value.toString()}
              />
              <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
  formatter={(value: number) => ['$' + formatNumber(value, 2)]}
  labelFormatter={(label: number) => isAnnualView ? `Year ${Math.ceil(label / 12)}` : `Month ${label}`}
  contentStyle={{
    backgroundColor: 'var(--popover)',
    borderColor: 'var(--border)',
    color: 'var(--popover-foreground)'
  }}
/>
              <Legend />
              {showLoanBalance && <Line type="monotone" dataKey="remainingBalance" name="Remaining Loan Balance" stroke="#8884d8" dot={false} activeDot={{ r: 8 }} />}
              {showCumulativeProfit && <Line type="monotone" dataKey="cumulativeProfit" name="Cumulative Profit" stroke="#82ca9d" dot={false} activeDot={{ r: 8 }} />}
              {showTotalValue && <Line type="monotone" dataKey="totalValue" name="Total Value" stroke="#ffc658" dot={false} activeDot={{ r: 8 }} />}
              {showCashFlow && <Line type="monotone" dataKey="cumulativeCashFlow" name="Cumulative Cash Flow" stroke="#ff7300" dot={false} activeDot={{ r: 8 }} />}
              {breakEvenMonth && (
                <ReferenceLine 
                  x={breakEvenMonth} 
                  stroke="red"
                  label={{ 
                    value: "Break-even", 
                    position: 'insideBottomLeft',
                    fill: 'var(--foreground)',
                    fontSize: 12
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectOverview
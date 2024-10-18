"use client"

import { useParams } from 'next/navigation'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function ProjectPage() {
  const params = useParams()
  const id = params.id as string
  const { projects } = useProject()
  const project = projects.find(p => p.id === id)

  if (!project) return <div>Project not found</div>

  const balanceSheet = project.data?.balanceSheet || {}
  const loanDetails = project.data?.loanDetails || {}

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

  // Calculate combined amortization and profit schedule
  const calculateCombinedSchedule = () => {
    let remainingBalance = loanAmount
    let totalInterest = 0
    let cumulativeProfit = 0
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

      // Profit calculations
      const monthlyProfit = operatingIncome / 12
      cumulativeProfit += monthlyProfit

      const totalValue = cumulativeProfit - loanAmount + (loanAmount - remainingBalance)

      if (totalValue >= 0 && breakEvenMonth === null) {
        breakEvenMonth = month
      }

      if (month % 12 === 0 || month === 1 || month === numberOfPayments || month === breakEvenMonth) {
        schedule.push({
          month,
          remainingBalance,
          cumulativeProfit,
          totalValue
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
          <CardTitle>Profit and Loan Amortization Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={schedule}
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
              <Line type="monotone" dataKey="remainingBalance" name="Remaining Loan Balance" stroke="#8884d8" />
              <Line type="monotone" dataKey="cumulativeProfit" name="Cumulative Profit" stroke="#82ca9d" />
              <Line type="monotone" dataKey="totalValue" name="Total Value" stroke="#ffc658" />
              {breakEvenMonth && (
                <ReferenceLine x={breakEvenMonth} stroke="red" label="Break-even" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
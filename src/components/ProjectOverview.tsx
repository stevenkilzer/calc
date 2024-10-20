import React, { useState, useEffect } from 'react'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { formatNumber } from "@/lib/utils"
import { CustomChart } from '@/components/CustomChart'
import { calculateFinancials, calculateCombinedSchedule, FinancialData, CalculatedFinancials } from '@/lib/financialCalculations'

const ProjectOverview: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { projects } = useProject()
  const project = projects.find(p => p.id === projectId)

  const [showLoanBalance, setShowLoanBalance] = useState(true)
  const [showMonthlyNetIncome, setShowMonthlyNetIncome] = useState(true)
  const [showMonthlyCashFlow, setShowMonthlyCashFlow] = useState(true)
  const [showCumulativeProfit, setShowCumulativeProfit] = useState(true)
  const [financials, setFinancials] = useState<CalculatedFinancials | null>(null)
  const [monthlyNetIncome, setMonthlyNetIncome] = useState(0)
  const [monthlyCashFlow, setMonthlyCashFlow] = useState(0)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (project && project.data) {
      const financialData: FinancialData = {
        balanceSheet: project.data.balanceSheet || {
          revenue: { ecommerce: 0, wholesale: 0 },
          cogs: 0,
          selling: 0,
          marketing: 0,
          coreOverhead: 0,
        },
        loanDetails: project.data.loanDetails || {
          isBusinessPurchase: false,
          purchasePrice: 0,
          downPayment: 0,
          thirdPartyInvestment: 0,
          loanAmount: 0,
          interestRate: 0,
          loanTerm: 0,
        },
        cashFlow: project.data.cashFlow || {
          operating: 0,
          investing: 0,
          financing: 0,
        },
      }

      const calculatedFinancials = calculateFinancials(financialData)
      setFinancials(calculatedFinancials)

      // Calculate monthly net income
      const monthlyIncome = calculatedFinancials.operatingIncome / 12
      setMonthlyNetIncome(monthlyIncome)

      // Calculate monthly cash flow
      const totalCashFlow = 
        financialData.cashFlow.operating +
        financialData.cashFlow.investing +
        financialData.cashFlow.financing
      
      const monthlyFlow = totalCashFlow / 12
      setMonthlyCashFlow(monthlyFlow)

      // Calculate chart data
      const { schedule, breakEvenMonth } = calculateCombinedSchedule(calculatedFinancials, financialData.loanDetails)
      
      // Calculate monthly loan payment
      const monthlyLoanPayment = calculatedFinancials.monthlyPayment

      // Add monthly net income, monthly cash flow, and cumulative profit to the schedule
      let cumulativeProfit = 0
      const updatedSchedule = schedule.map((item, index) => {
        const monthlyProfit = monthlyIncome - monthlyLoanPayment
        cumulativeProfit += monthlyProfit
        return {
          ...item,
          monthlyNetIncome: monthlyIncome,
          monthlyCashFlow: monthlyFlow,
          cumulativeProfit: cumulativeProfit
        }
      })

      setChartData(updatedSchedule)
    }
  }, [project])

  if (!project || !financials) return <div>Loading project data...</div>

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
                <TableCell>${formatNumber(financials.netRevenue)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Gross Profit</TableCell>
                <TableCell>${formatNumber(financials.grossProfit)} ({formatNumber(financials.grossMargin, 1)}%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Operating Income</TableCell>
                <TableCell>${formatNumber(financials.operatingIncome)} ({formatNumber(financials.operatingMargin, 1)}%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Loan Amount</TableCell>
                <TableCell>${formatNumber(financials.loanAmount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Monthly Loan Payment</TableCell>
                <TableCell>${formatNumber(financials.monthlyPayment)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Monthly Net Income</TableCell>
                <TableCell>${formatNumber(monthlyNetIncome)}</TableCell>
              </TableRow>
              {chartData.length > 0 && chartData[chartData.length - 1].breakEvenMonth && (
                <TableRow>
                  <TableCell className="font-medium">Break-even Point</TableCell>
                  <TableCell>{chartData[chartData.length - 1].breakEvenMonth} months</TableCell>
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
              <Switch id="monthly-net-income" checked={showMonthlyNetIncome} onCheckedChange={setShowMonthlyNetIncome} />
              <Label htmlFor="monthly-net-income">Show Monthly Net Income</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="cumulative-profit" checked={showCumulativeProfit} onCheckedChange={setShowCumulativeProfit} />
              <Label htmlFor="cumulative-profit">Show Cumulative Profit</Label>
            </div>
          </div>
          <CustomChart
            data={chartData}
            title=""
            showLoanBalance={showLoanBalance}
            showMonthlyNetIncome={showMonthlyNetIncome}
            showMonthlyCashFlow={showMonthlyCashFlow}
            showCumulativeProfit={showCumulativeProfit}
            breakEvenMonth={chartData.length > 0 ? chartData[chartData.length - 1].breakEvenMonth : undefined}
            height={600}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default ProjectOverview;
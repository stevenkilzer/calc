import React, { useState } from 'react'
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
  const [showCumulativeProfit, setShowCumulativeProfit] = useState(true)
  const [showCashFlow, setShowCashFlow] = useState(true)
  const [isAnnualView, setIsAnnualView] = useState(false)

  if (!project) return <div>Project not found</div>

  const financialData: FinancialData = {
    balanceSheet: project.data?.balanceSheet || {
      revenue: { ecommerce: 0, wholesale: 0 },
      cogs: 0,
      selling: 0,
      marketing: 0,
      coreOverhead: 0,
    },
    loanDetails: project.data?.loanDetails || {
      isBusinessPurchase: false,
      purchasePrice: 0,
      downPayment: 0,
      thirdPartyInvestment: 0,
      loanAmount: 0,
      interestRate: 0,
      loanTerm: 0,
    },
    cashFlow: {
      operating: calculateCashFlowTotal(project.data?.cashFlow?.operatingActivities),
      investing: calculateCashFlowTotal(project.data?.cashFlow?.investingActivities),
      financing: calculateCashFlowTotal(project.data?.cashFlow?.financingActivities),
    },
  }

  const financials: CalculatedFinancials = calculateFinancials(financialData)
  const { schedule, breakEvenMonth } = calculateCombinedSchedule(financials, financialData.loanDetails)

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
                <TableCell className="font-medium">Net Cash Flow</TableCell>
                <TableCell>${formatNumber(financials.netCashFlow)}</TableCell>
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
              <Switch id="cash-flow" checked={showCashFlow} onCheckedChange={setShowCashFlow} />
              <Label htmlFor="cash-flow">Show Cash Flow</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="annual-view" checked={isAnnualView} onCheckedChange={setIsAnnualView} />
              <Label htmlFor="annual-view">Annual View</Label>
            </div>
          </div>
          <CustomChart
            data={schedule}
            title=""
            showLoanBalance={showLoanBalance}
            showCumulativeProfit={showCumulativeProfit}
            showCashFlow={showCashFlow}
            isAnnualView={isAnnualView}
            breakEvenMonth={breakEvenMonth}
            height={600}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to safely calculate cash flow totals
function calculateCashFlowTotal(activities: Record<string, unknown> | undefined): number {
  if (!activities) return 0;
  return Object.values(activities).reduce((sum, value) => {
    if (typeof value === 'number') {
      return sum + value;
    }
    return sum;
  }, 0);
}

export default ProjectOverview
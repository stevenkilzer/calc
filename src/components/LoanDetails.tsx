import React, { useState, useEffect } from 'react'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils"
import { LoanAmortizationChart } from '@/components/LoanAmortizationChart'
import { calculateFinancials, generateAmortizationSchedule, FinancialData, CalculatedFinancials } from '@/lib/financialCalculations'

type LoanData = FinancialData['loanDetails']

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

  const [showPrincipalPayment, setShowPrincipalPayment] = useState(true)
  const [showInterestPayment, setShowInterestPayment] = useState(true)

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

  const calculatedLoanAmount = data.isBusinessPurchase
    ? data.purchasePrice - data.downPayment - data.thirdPartyInvestment
    : data.loanAmount

  const financials: CalculatedFinancials = calculateFinancials({
    balanceSheet: project?.data?.balanceSheet || { revenue: { ecommerce: 0, wholesale: 0 }, cogs: 0, selling: 0, marketing: 0, coreOverhead: 0 },
    loanDetails: { ...data, loanAmount: calculatedLoanAmount },
    cashFlow: project?.data?.cashFlow || { operating: 0, investing: 0, financing: 0 },
  })

  const amortizationSchedule = generateAmortizationSchedule({ ...data, loanAmount: calculatedLoanAmount })

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
              {renderRow("Monthly Payment", financials.monthlyPayment, null)}
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
          <div className="mb-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Switch id="principal-payment" checked={showPrincipalPayment} onCheckedChange={setShowPrincipalPayment} />
              <Label htmlFor="principal-payment">Show Principal Payment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="interest-payment" checked={showInterestPayment} onCheckedChange={setShowInterestPayment} />
              <Label htmlFor="interest-payment">Show Interest Payment</Label>
            </div>
          </div>
          <LoanAmortizationChart
            data={amortizationSchedule}
            showPrincipalPayment={showPrincipalPayment}
            showInterestPayment={showInterestPayment}
            height={400}
          />
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
              {renderRow("Total Interest", formatNumber(financials.totalInterest))}
              {renderRow("Total Paid", formatNumber(financials.totalPaid))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoanDetails
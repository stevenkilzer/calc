import React, { useState, useEffect } from 'react'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatNumber } from "@/lib/utils"

type CashFlowData = {
  operatingActivities: {
    netIncome: number;
    depreciation: number;
    accountsReceivable: number;
    inventory: number;
    accountsPayable: number;
    otherOperating: number;
  };
  investingActivities: {
    capitalExpenditures: number;
    investments: number;
    otherInvesting: number;
  };
  financingActivities: {
    debtIssuance: number;
    debtRepayment: number;
    dividendsPaid: number;
    stockIssuance: number;
    otherFinancing: number;
  };
}

const CashFlow: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { projects, updateProjectData } = useProject()
  const project = projects.find(p => p.id === projectId)

  const [cashFlowData, setCashFlowData] = useState<CashFlowData>({
    operatingActivities: {
      netIncome: 0,
      depreciation: 0,
      accountsReceivable: 0,
      inventory: 0,
      accountsPayable: 0,
      otherOperating: 0
    },
    investingActivities: {
      capitalExpenditures: 0,
      investments: 0,
      otherInvesting: 0
    },
    financingActivities: {
      debtIssuance: 0,
      debtRepayment: 0,
      dividendsPaid: 0,
      stockIssuance: 0,
      otherFinancing: 0
    }
  })

  useEffect(() => {
    if (project?.data) {
      const { balanceSheet, loanDetails, cashFlow } = project.data

      // Populate data from other sources and existing cash flow data
      setCashFlowData(prevData => ({
        operatingActivities: {
          ...prevData.operatingActivities,
          ...cashFlow?.operatingActivities,
          netIncome: calculateNetIncome(balanceSheet)
        },
        investingActivities: {
          ...prevData.investingActivities,
          ...cashFlow?.investingActivities
        },
        financingActivities: {
          ...prevData.financingActivities,
          ...cashFlow?.financingActivities,
          debtIssuance: loanDetails?.loanAmount || 0,
          debtRepayment: calculateAnnualLoanPayment(loanDetails)
        }
      }))
    }
  }, [project])

  const calculateNetIncome = (balanceSheet: any) => {
    if (!balanceSheet) return 0
    const revenue = (balanceSheet.revenue?.ecommerce || 0) + (balanceSheet.revenue?.wholesale || 0)
    const expenses = (balanceSheet.cogs || 0) + (balanceSheet.selling || 0) + 
                     (balanceSheet.marketing || 0) + (balanceSheet.coreOverhead || 0)
    return revenue - expenses
  }

  const calculateAnnualLoanPayment = (loanDetails: any) => {
    if (!loanDetails) return 0
    const { loanAmount, interestRate, loanTerm } = loanDetails
    const monthlyRate = interestRate / 12 / 100
    const numberOfPayments = loanTerm * 12
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                           (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    return monthlyPayment * 12
  }

  const handleInputChange = (category: keyof CashFlowData, field: string, value: number) => {
    setCashFlowData(prevData => ({
      ...prevData,
      [category]: {
        ...prevData[category],
        [field]: value
      }
    }))
  }

  const handleSave = () => {
    if (project) {
      updateProjectData(projectId, { ...project.data, cashFlow: cashFlowData })
    }
  }

  const calculateTotal = (category: keyof CashFlowData) => {
    return Object.values(cashFlowData[category]).reduce((sum, value) => sum + value, 0)
  }

  const netCashFlow = calculateTotal('operatingActivities') + 
                      calculateTotal('investingActivities') + 
                      calculateTotal('financingActivities')

  const renderField = (label: string, value: number, editable: boolean, category: keyof CashFlowData, field: string) => (
    <TableRow key={field}>
      <TableCell className="pl-8">{label}</TableCell>
      <TableCell>
        {editable ? (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(category, field, Number(e.target.value))}
            className="w-full"
          />
        ) : (
          `$${formatNumber(value)}`
        )}
      </TableCell>
    </TableRow>
  )

  const renderSection = (title: string, data: Record<string, number>, category: keyof CashFlowData) => (
    <>
      <TableRow className="bg-muted">
        <TableCell colSpan={2} className="font-medium">{title}</TableCell>
      </TableRow>
      {Object.entries(data).map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
        const editable = !(
          (category === 'operatingActivities' && key === 'netIncome') ||
          (category === 'financingActivities' && (key === 'debtIssuance' || key === 'debtRepayment'))
        )
        return renderField(label, value, editable, category, key)
      })}
      <TableRow className="h-16">
        <TableCell className="font-medium pl-8">Total {title}</TableCell>
        <TableCell className="font-medium " >${formatNumber(calculateTotal(category))}</TableCell>
      </TableRow>
    </>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-medium mb-4">Cash Flow - {project?.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Item</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderSection('Operating Activities', cashFlowData.operatingActivities, 'operatingActivities')}
              {renderSection('Investing Activities', cashFlowData.investingActivities, 'investingActivities')}
              {renderSection('Financing Activities', cashFlowData.financingActivities, 'financingActivities')}
              <TableRow className="bg-muted">
                <TableCell className="font-bold">Net Cash Flow</TableCell>
                <TableCell className="font-bold">${formatNumber(netCashFlow)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-4">
            <Button onClick={handleSave}>Save Cash Flow Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CashFlow
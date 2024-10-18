"use client"

import React, { useState, useEffect } from 'react'
import { useProject } from './ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type CalculatorData = {
  revenue: number;
  expenses: number;
  assets: {
    current: number;
    nonCurrent: number;
  };
  liabilities: {
    current: number;
    nonCurrent: number;
  };
  equity: number;
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
  };
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
}

export const BusinessCalculator: React.FC<{ projectId?: string }> = ({ projectId }) => {
  const { projects, updateProjectData } = useProject()
  const project = projectId ? projects.find(p => p.id === projectId) : null

  const initialData: CalculatorData = {
    revenue: 0,
    expenses: 0,
    assets: { current: 0, nonCurrent: 0 },
    liabilities: { current: 0, nonCurrent: 0 },
    equity: 0,
    cashFlow: { operating: 0, investing: 0, financing: 0 },
    loanAmount: 0,
    interestRate: 0,
    loanTerm: 0,
  }

  const [data, setData] = useState<CalculatorData>(project?.data || initialData)

  useEffect(() => {
    if (project && project.data) {
      setData(project.data)
    }
  }, [project])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setData(prevData => {
      const newData = { ...prevData }
      
      if (name.includes('.')) {
        const [category, subCategory] = name.split('.')
        newData[category as keyof CalculatorData][subCategory] = parseFloat(value) || 0
      } else {
        newData[name as keyof CalculatorData] = parseFloat(value) || 0
      }

      return newData
    })
  }

  const calculateResults = () => {
    const netIncome = data.revenue - data.expenses
    const totalAssets = data.assets.current + data.assets.nonCurrent
    const totalLiabilities = data.liabilities.current + data.liabilities.nonCurrent
    const netCashFlow = data.cashFlow.operating + data.cashFlow.investing + data.cashFlow.financing

    const monthlyInterestRate = data.interestRate / 12 / 100
    const numberOfPayments = data.loanTerm * 12
    const monthlyPayment = data.loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)

    return {
      netIncome,
      totalAssets,
      totalLiabilities,
      netCashFlow,
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment
    }
  }

  const results = calculateResults()

  const handleSave = () => {
    if (projectId) {
      updateProjectData(projectId, data)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Business Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="revenue">Revenue</Label>
              <Input
                id="revenue"
                name="revenue"
                type="number"
                value={data.revenue}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="expenses">Expenses</Label>
              <Input
                id="expenses"
                name="expenses"
                type="number"
                value={data.expenses}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="assets.current">Current Assets</Label>
              <Input
                id="assets.current"
                name="assets.current"
                type="number"
                value={data.assets.current}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="assets.nonCurrent">Non-Current Assets</Label>
              <Input
                id="assets.nonCurrent"
                name="assets.nonCurrent"
                type="number"
                value={data.assets.nonCurrent}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="liabilities.current">Current Liabilities</Label>
              <Input
                id="liabilities.current"
                name="liabilities.current"
                type="number"
                value={data.liabilities.current}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="liabilities.nonCurrent">Non-Current Liabilities</Label>
              <Input
                id="liabilities.nonCurrent"
                name="liabilities.nonCurrent"
                type="number"
                value={data.liabilities.nonCurrent}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="equity">Equity</Label>
              <Input
                id="equity"
                name="equity"
                type="number"
                value={data.equity}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="cashFlow.operating">Operating Cash Flow</Label>
              <Input
                id="cashFlow.operating"
                name="cashFlow.operating"
                type="number"
                value={data.cashFlow.operating}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="cashFlow.investing">Investing Cash Flow</Label>
              <Input
                id="cashFlow.investing"
                name="cashFlow.investing"
                type="number"
                value={data.cashFlow.investing}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="cashFlow.financing">Financing Cash Flow</Label>
              <Input
                id="cashFlow.financing"
                name="cashFlow.financing"
                type="number"
                value={data.cashFlow.financing}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="loanAmount">Loan Amount</Label>
              <Input
                id="loanAmount"
                name="loanAmount"
                type="number"
                value={data.loanAmount}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                name="interestRate"
                type="number"
                value={data.interestRate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="loanTerm">Loan Term (years)</Label>
              <Input
                id="loanTerm"
                name="loanTerm"
                type="number"
                value={data.loanTerm}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Net Income: ${results.netIncome.toFixed(2)}</p>
            <p>Total Assets: ${results.totalAssets.toFixed(2)}</p>
            <p>Total Liabilities: ${results.totalLiabilities.toFixed(2)}</p>
            <p>Net Cash Flow: ${results.netCashFlow.toFixed(2)}</p>
            <p>Monthly Loan Payment: ${results.monthlyPayment.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {projectId && (
        <Button onClick={handleSave}>Save Project Data</Button>
      )}
    </div>
  )
}
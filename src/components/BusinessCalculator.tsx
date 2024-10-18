'use client';
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, Legend } from 'recharts';
import { useTheme } from '@/components/ThemeProvider'
import { useProject } from '@/components/ProjectContext'

type InputValues = {
  revenue: number
  cogs: number
  opex: number
  businessPurchasePrice: number
  downPayment: number
  thirdPartyInvestment: number
  interestRate: number
  loanTerm: number
}

type Results = {
  grossProfit: number
  netProfit: number
  grossMargin: number
  netMargin: number
  loanAmount: number
  monthlyPayment: number
  totalInterest: number
  cashFlow: number
}

type AmortizationData = {
  month: number;
  remainingBalance: number;
  totalIncome: number;
  cumulativeProfit: number;
}

const initialInputs: InputValues = {
  revenue: 220000,
  cogs: 28000,
  opex: 82000,
  businessPurchasePrice: 700000,
  downPayment: 80000,
  thirdPartyInvestment: 0,
  interestRate: 4,
  loanTerm: 10,
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function BusinessCalculator() {
  const { currentProject, updateProjectData } = useProject()
  const [inputs, setInputs] = useState<InputValues>(initialInputs)
  const [results, setResults] = useState<Results | null>(null)
  const [amortizationData, setAmortizationData] = useState<AmortizationData[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    if (currentProject && currentProject.data) {
      setInputs(currentProject.data.inputs || initialInputs)
      setResults(currentProject.data.results || null)
      setAmortizationData(currentProject.data.amortizationData || [])
    } else {
      setInputs(initialInputs)
      setResults(null)
      setAmortizationData([])
    }
  }, [currentProject])

  const handleInputChange = (key: keyof InputValues, value: string) => {
    const updatedInputs = {
      ...inputs,
      [key]: Number(value.replace(/[^0-9.-]+/g,"")) || 0
    }
    setInputs(updatedInputs)
    if (currentProject) {
      updateProjectData(currentProject.id, { 
        inputs: updatedInputs, 
        results, 
        amortizationData 
      })
    }
  }

  const calculateResults = () => {
    const { revenue, cogs, opex, businessPurchasePrice, downPayment, thirdPartyInvestment, interestRate, loanTerm } = inputs
    
    const grossProfit = revenue - cogs
    const netProfit = grossProfit - opex
    const grossMargin = revenue !== 0 ? (grossProfit / revenue) * 100 : 0
    const netMargin = revenue !== 0 ? (netProfit / revenue) * 100 : 0
    
    const loanAmount = businessPurchasePrice - downPayment - thirdPartyInvestment
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm * 12
    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    const totalInterest = (monthlyPayment * numberOfPayments) - loanAmount
    
    const cashFlow = netProfit - (monthlyPayment * 12)

    const newResults = {
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      loanAmount,
      monthlyPayment,
      totalInterest,
      cashFlow
    }

    setResults(newResults)

    let balance = loanAmount;
    let totalIncome = 0;
    let cumulativeProfit = -downPayment;
    const amortization: AmortizationData[] = [];

    for (let month = 1; month <= numberOfPayments; month++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;

      const monthlyIncome = (revenue - cogs - opex) / 12;
      totalIncome += monthlyIncome;
      const monthlyProfit = monthlyIncome - monthlyPayment;
      cumulativeProfit += monthlyProfit;

      amortization.push({
        month,
        remainingBalance: balance,
        totalIncome,
        cumulativeProfit,
      });
    }

    setAmortizationData(amortization);

    if (currentProject) {
      updateProjectData(currentProject.id, { 
        inputs, 
        results: newResults, 
        amortizationData: amortization 
      })
    }
  }

  const renderInputSection = (title: string, keys: (keyof InputValues)[]) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {keys.map((key) => (
          <div key={key}>
            <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
            <Input
              id={key}
              type="text"
              value={key === 'interestRate' ? inputs[key] : formatNumber(inputs[key])}
              onChange={(e) => handleInputChange(key, e.target.value)}
            />
          </div>
        ))}
        {title === "Purchase Structure" && results && (
          <div>
            <Label>Loan Amount</Label>
            <div className="p-2 bg-secondary rounded">{formatCurrency(results.loanAmount)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderResultsSection = (title: string, data: Record<string, number>) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {Object.entries(data).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell>{key.charAt(0).toUpperCase() + key.slice(1)}</TableCell>
                <TableCell className="text-right">
                  {key.includes('Margin') ? formatPercentage(value) : formatCurrency(value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const renderAmortizationChart = () => {
    const paybackMonth = amortizationData.findIndex(data => data.cumulativeProfit >= inputs.downPayment);

    const chartConfig = {
      remainingBalance: { label: "Remaining Balance", color: "hsl(var(--chart-1))" },
      totalIncome: { label: "Total Income", color: "hsl(var(--chart-2))" },
      cumulativeProfit: { label: "Cumulative Profit", color: "hsl(var(--chart-3))" },
    };

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Amortization Chart</CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          {amortizationData.length > 0 ? (
            <ChartContainer className="h-[400px] w-full" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={amortizationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Month', position: 'bottom', fill: "hsl(var(--foreground))" }}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis 
                    label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', fill: "hsl(var(--foreground))" }} 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <Tooltip 
                    formatter={(value) => `$${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend 
                    wrapperStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="remainingBalance" 
                    name="Remaining Balance"
                    stroke="hsl(var(--chart-1))"
                    dot={false} 
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalIncome" 
                    name="Total Income"
                    stroke="hsl(var(--chart-2))"
                    dot={false} 
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeProfit" 
                    name="Cumulative Profit"
                    stroke="hsl(var(--chart-3))"
                    dot={false} 
                    activeDot={{ r: 8 }}
                  />
                  {paybackMonth !== -1 && (
                    <ReferenceLine 
                      x={paybackMonth} 
                      stroke="hsl(var(--foreground))"
                      label={{ value: 'Down Payment Recouped', position: 'top', fill: "hsl(var(--foreground))" }} 
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div>No amortization data available</div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderInputSection("Business Inputs", ['revenue', 'cogs', 'opex'])}
        {renderInputSection("Purchase Structure", ['businessPurchasePrice', 'downPayment', 'thirdPartyInvestment', 'interestRate', 'loanTerm'])}
        <div className="space-y-6">
          {results && (
            <>
              {renderResultsSection("Balance Sheet Outputs", {
                grossProfit: results.grossProfit,
                netProfit: results.netProfit,
                grossMargin: results.grossMargin,
                netMargin: results.netMargin,
              })}
              {renderResultsSection("Loan Details", {
                monthlyPayment: results.monthlyPayment,
                totalInterest: results.totalInterest,
              })}
              {renderResultsSection("Cash Flow", {
                annualCashFlow: results.cashFlow,
              })}
            </>
          )}
        </div>
      </div>
      <div className="flex justify-left">
        <Button onClick={calculateResults} size="sm">Calculate</Button>
      </div>
      {results && renderAmortizationChart()}
    </div>
  )
}
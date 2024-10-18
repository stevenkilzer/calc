"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function IncomeStatementPage() {
  const params = useParams()
  const id = params.id as string
  const { projects, updateProjectData } = useProject()
  const project = projects.find(p => p.id === id)

  const [revenue, setRevenue] = useState(0)
  const [expenses, setExpenses] = useState(0)

  useEffect(() => {
    if (project && project.data) {
      setRevenue(project.data.revenue || 0)
      setExpenses(project.data.expenses || 0)
    }
  }, [project])

  const handleSave = () => {
    if (project) {
      updateProjectData(id, { ...project.data, revenue, expenses })
    }
  }

  const netIncome = revenue - expenses

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Income Statement - {project?.name}</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Income Statement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue">Revenue</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="expenses">Expenses</Label>
                <Input
                  id="expenses"
                  type="number"
                  value={expenses}
                  onChange={(e) => setExpenses(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <p className="font-bold">Net Income: ${netIncome.toFixed(2)}</p>
            </div>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
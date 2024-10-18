"use client"

import { useState } from 'react'
import { useProject } from '@/components/ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function Home() {
  const { projects, addProject } = useProject()
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName)
      setNewProjectName('')
      setIsAddProjectDialogOpen(false)
    }
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Business Calculator</h1>
      
      <div className="mb-8">
        <Button 
          onClick={() => setIsAddProjectDialogOpen(true)} 
          className="w-full max-w-[400px] flex items-center justify-center"
          variant="default"
        >
          <Plus className="mr-2 h-4 w-4" /> Start a New Project
        </Button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>
      
      {projects.length === 0 ? (
        <p>You haven't created any projects yet. Start by creating a new project!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link href={`/project/${project.id}`} key={project.id}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to view project details
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={isAddProjectDialogOpen} onOpenChange={setIsAddProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleAddProject()
          }}>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <Button type="submit">Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
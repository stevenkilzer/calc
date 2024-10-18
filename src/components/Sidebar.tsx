"use client"

import React, { useState } from 'react'
import { Home, Search, Layers, Sun, Moon, User, Settings, HelpCircle, ChevronDown, ChevronRight, Zap, X, Menu, Plus, Trash2, Edit2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from '@/components/ThemeProvider'
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useProject } from '@/components/ProjectContext'
import Link from 'next/link'

const Sidebar = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const [isOpen, setIsOpen] = useState(true)
  const [newProjectName, setNewProjectName] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false)
  const { projects, addProject, deleteProject } = useProject()
  const { theme, toggleTheme } = useTheme()

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName)
      setNewProjectName('')
      setIsAddProjectDialogOpen(false)
    }
  }

  const handleDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete)
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }

  return (
    <>
      {!isOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-[250px] bg-background transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Business Time</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          <Link href="/">
            <NavItem icon={<Home className="mr-2 h-4 w-4" />}>Home</NavItem>
          </Link>
          <NavItem icon={<Search className="mr-2 h-4 w-4" />}>Search</NavItem>
          <div className="py-1">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-semibold">Projects</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0"
                onClick={() => setIsAddProjectDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {projects.map((project) => (
              <ProjectItem 
                key={project.id} 
                id={project.id}
                name={project.name} 
                onDelete={() => {
                  setProjectToDelete(project.id)
                  setIsDeleteDialogOpen(true)
                }}
              />
            ))}
          </div>
        </nav>
        <div className="mt-auto border-t p-2 space-y-1">
          <NavItem 
            icon={theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
            onClick={toggleTheme}
          >
            Theme
          </NavItem>
          <NavItem icon={<User className="mr-2 h-4 w-4" />}>Account</NavItem>
          <NavItem icon={<Settings className="mr-2 h-4 w-4" />}>Settings</NavItem>
          <NavItem icon={<HelpCircle className="mr-2 h-4 w-4" />}>Help</NavItem>
        </div>
      </div>
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this project? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProject}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const NavItem = ({ 
  children, 
  icon, 
  indent = false,
  onClick
}: { 
  children: React.ReactNode
  icon?: React.ReactNode
  indent?: boolean
  onClick?: () => void
}) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start font-normal h-8 px-2",
        indent && "pl-8"
      )}
      onClick={onClick}
    >
      {icon}
      {children}
    </Button>
  )
}

const ProjectItem = ({ id, name, onDelete }: { id: string, name: string; onDelete: () => void }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
    const [newName, setNewName] = useState(name)
    const { updateProjectName } = useProject()
  
    const handleRename = () => {
      if (newName.trim() && newName !== name) {
        updateProjectName(id, newName)
        setIsRenameDialogOpen(false)
      }
    }

    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative"
      >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="w-full justify-start font-normal h-8 px-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center w-full">
            <div className="w-6 mr-2 flex justify-center">
              {isHovered || isOpen ? (
                isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </div>
            {name}
          </div>
        </Button>
        {isHovered && (
          <div className="absolute right-0 flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                setIsRenameDialogOpen(true)
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {isOpen && (
        <div className="ml-6 space-y-1 mt-1">
          <Link href={`/project/${id}`}>
            <NavItem>Overview</NavItem>
          </Link>
          <Link href={`/project/${id}/balance-sheet`}>
            <NavItem>Balance Sheet</NavItem>
          </Link>
          <Link href={`/project/${id}/cash-flow`}>
            <NavItem>Cash Flow</NavItem>
          </Link>
          <Link href={`/project/${id}/income-statement`}>
            <NavItem>Income Statement</NavItem>
          </Link>
          <Link href={`/project/${id}/loan-details`}>
            <NavItem>Loan Details</NavItem>
          </Link>
        </div>
      )}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleRename()
          }}>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="New project name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Button type="submit">Rename</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Sidebar
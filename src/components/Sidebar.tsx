"use client"

import React, { useState, useEffect } from 'react'
import { Home, Search, Layers, Sun, Moon, User, Settings, HelpCircle, ChevronDown, ChevronRight, Zap, X, Menu, Plus } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from './ThemeProvider'
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Project = {
  id: string;
  name: string;
}

const Sidebar = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  const [isOpen, setIsOpen] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [newProjectName, setNewProjectName] = useState('')

  useEffect(() => {
    const storedProjects = localStorage.getItem('projects')
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects))
    }
  }, [])

  const addProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName.trim()
      }
      const updatedProjects = [...projects, newProject]
      setProjects(updatedProjects)
      localStorage.setItem('projects', JSON.stringify(updatedProjects))
      setNewProjectName('')
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
        <SidebarContent projects={projects} addProject={addProject} setNewProjectName={setNewProjectName} newProjectName={newProjectName} />
      </div>
    </>
  )
}

const SidebarContent = ({ projects, addProject, setNewProjectName, newProjectName }: { 
  projects: Project[], 
  addProject: () => void, 
  setNewProjectName: (name: string) => void, 
  newProjectName: string 
}) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <nav className="flex-1 space-y-1 p-2">
        <NavItem icon={<Home className="mr-2 h-4 w-4" />}>Home</NavItem>
        <NavItem icon={<Search className="mr-2 h-4 w-4" />}>Search</NavItem>
        <div className="py-1">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-semibold">Projects</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                  <Button onClick={addProject}>Add</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {projects.map((project) => (
            <ProjectDropdown key={project.id} name={project.name} />
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

const ProjectDropdown = ({ name }: { name: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="space-y-1"
    >
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
      {isOpen && (
        <div className="ml-6 space-y-1">
          <NavItem>Analysis</NavItem>
          <NavItem>Setups</NavItem>
          <NavItem>Views</NavItem>
        </div>
      )}
    </div>
  )
}

export default Sidebar
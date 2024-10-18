"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Project = {
  id: string;
  name: string;
  data?: any; // This will store the business calculator data
}

type ProjectContextType = {
  projects: Project[];
  currentProject: Project | null;
  addProject: (name: string) => void;
  selectProject: (id: string) => void;
  updateProjectData: (id: string, data: any) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  useEffect(() => {
    const storedProjects = localStorage.getItem('projects')
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects))
    }
  }, [])

  const addProject = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: name.trim(),
    }
    const updatedProjects = [...projects, newProject]
    setProjects(updatedProjects)
    localStorage.setItem('projects', JSON.stringify(updatedProjects))
    setCurrentProject(newProject)
  }

  const selectProject = (id: string) => {
    const project = projects.find(p => p.id === id)
    if (project) {
      setCurrentProject(project)
    }
  }

  const updateProjectData = (id: string, data: any) => {
    const updatedProjects = projects.map(project => 
      project.id === id ? { ...project, data } : project
    )
    setProjects(updatedProjects)
    localStorage.setItem('projects', JSON.stringify(updatedProjects))
    if (currentProject && currentProject.id === id) {
      setCurrentProject({ ...currentProject, data })
    }
  }

  return (
    <ProjectContext.Provider value={{ projects, currentProject, addProject, selectProject, updateProjectData }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
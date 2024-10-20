"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { generateSampleProject } from './generateSampleProject' // Make sure to create this file

type Project = {
  id: string;
  name: string;
  data?: any;
}

type ProjectContextType = {
  projects: Project[];
  currentProject: Project | null;
  addProject: (name: string) => void;
  selectProject: (id: string) => void;
  updateProjectData: (id: string, data: any) => void;
  deleteProject: (id: string) => void;
  updateProjectName: (id: string, newName: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  useEffect(() => {
    const storedProjects = localStorage.getItem('projects')
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects))
    } else {
      // If no projects exist, create the sample project
      const sampleProject = generateSampleProject()
      setProjects([sampleProject])
      localStorage.setItem('projects', JSON.stringify([sampleProject]))
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

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter(project => project.id !== id)
    setProjects(updatedProjects)
    localStorage.setItem('projects', JSON.stringify(updatedProjects))
    if (currentProject && currentProject.id === id) {
      setCurrentProject(updatedProjects.length > 0 ? updatedProjects[0] : null)
    }
  }

  const updateProjectName = (id: string, newName: string) => {
    const updatedProjects = projects.map(project => 
      project.id === id ? { ...project, name: newName.trim() } : project
    )
    setProjects(updatedProjects)
    localStorage.setItem('projects', JSON.stringify(updatedProjects))
    if (currentProject && currentProject.id === id) {
      setCurrentProject({ ...currentProject, name: newName.trim() })
    }
  }

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      currentProject, 
      addProject, 
      selectProject, 
      updateProjectData, 
      deleteProject,
      updateProjectName
    }}>
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
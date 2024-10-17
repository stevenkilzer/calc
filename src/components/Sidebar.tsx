"use client"

import React, { useState } from 'react'
import { Home, Search, Layers, Sun, Moon, User, Settings, HelpCircle, ChevronDown, ChevronRight, Zap } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from './ThemeProvider'

const Sidebar = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Layers className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SidebarContent />
      </SheetContent>

      <div className={cn("hidden lg:block", className)}>
        <SidebarContent />
      </div>
    </Sheet>
  )
}

const SidebarContent = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-background">
      <div className="flex items-center justify-between p-3">
        <h2 className="text-lg font-semibold">Business Time</h2>
        <Button variant="ghost" size="icon">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        <NavItem icon={<Home className="mr-2 h-4 w-4" />}>Home</NavItem>
        <NavItem icon={<Search className="mr-2 h-4 w-4" />}>Search</NavItem>
        <div className="py-1">
          <h3 className="mb-1 px-2 text-sm font-semibold">Projects</h3>
          <ProjectDropdown name="Default Project" />
          {/* You can add more ProjectDropdown components here for other projects */}
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
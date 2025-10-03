"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("app_theme") as Theme
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const systemTheme = prefersDark ? "dark" : "light"
      setThemeState(systemTheme)
      applyTheme(systemTheme)
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("app_theme", newTheme)
    applyTheme(newTheme)
    window.dispatchEvent(new CustomEvent("themeChange", { detail: newTheme }))
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
  }

  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

// Hook without requiring provider
export function useThemeStorage() {
  const [theme, setThemeState] = useState<Theme>("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme") as Theme
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme)
    }

    const handleThemeChange = (e: CustomEvent) => {
      setThemeState(e.detail)
    }

    window.addEventListener("themeChange" as any, handleThemeChange)
    return () => {
      window.removeEventListener("themeChange" as any, handleThemeChange)
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("app_theme", newTheme)
    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    window.dispatchEvent(new CustomEvent("themeChange", { detail: newTheme }))
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
  }

  return { theme, setTheme, toggleTheme }
}


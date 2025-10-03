"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "sw"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem("app_language") as Language
    if (savedLanguage === "en" || savedLanguage === "sw") {
      setLanguageState(savedLanguage)
    }
  }, [])

  // Save language to localStorage whenever it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("app_language", lang)
    // Dispatch event so other components can listen
    window.dispatchEvent(new CustomEvent("languageChange", { detail: lang }))
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

// Hook to get language without requiring provider (for backwards compatibility)
export function useLanguageStorage() {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("app_language") as Language
    if (savedLanguage === "en" || savedLanguage === "sw") {
      setLanguageState(savedLanguage)
    }

    // Listen for language changes
    const handleLanguageChange = (e: CustomEvent) => {
      setLanguageState(e.detail)
    }

    window.addEventListener("languageChange" as any, handleLanguageChange)
    return () => {
      window.removeEventListener("languageChange" as any, handleLanguageChange)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("app_language", lang)
    window.dispatchEvent(new CustomEvent("languageChange", { detail: lang }))
  }

  return { language, setLanguage }
}


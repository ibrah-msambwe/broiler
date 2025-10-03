"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Apple,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Bell
} from "lucide-react"
import { toast } from "sonner"
import { playNotificationSound } from "@/lib/audio-notifications"
import { useLanguageStorage } from "@/lib/language-context"

interface FeedStageAlertsProps {
  batch: {
    id: string
    name: string
    startDate: string
    status: string
    birdCount: number
  }
}

interface FeedStage {
  id: string
  name: string
  nameSwahili: string
  startDay: number
  endDay: number
  color: string
  icon: string
  description: string
  descriptionSwahili: string
  recommendations: string[]
  recommendationsSwahili: string[]
}

const FEED_STAGES: FeedStage[] = [
  {
    id: 'starter',
    name: 'Starter Feed',
    nameSwahili: 'Chakula cha Kuanza',
    startDay: 1,
    endDay: 14,
    color: 'bg-blue-500',
    icon: '🐣',
    description: 'High protein feed for chicks (21-23% protein)',
    descriptionSwahili: 'Chakula chenye protini nyingi kwa vifaranga (21-23% protini)',
    recommendations: [
      'Feed 4-6 times per day',
      'Ensure fresh water always available',
      'Maintain brooding temperature',
      'Small crumb size for easy eating'
    ],
    recommendationsSwahili: [
      'Lisha mara 4-6 kwa siku',
      'Hakikisha maji safi yapo kila wakati',
      'Tunza joto la kuotea',
      'Ukubwa mdogo wa chakula kwa urahisi wa kula'
    ]
  },
  {
    id: 'grower',
    name: 'Grower Feed',
    nameSwahili: 'Chakula cha Kukua',
    startDay: 14,
    endDay: 22,
    color: 'bg-green-500',
    icon: '🐔',
    description: 'Moderate protein feed for growth (18-20% protein)',
    descriptionSwahili: 'Chakula cha wastani cha protini kwa ukuaji (18-20% protini)',
    recommendations: [
      'Feed 3-4 times per day',
      'Increase feed quantity gradually',
      'Monitor weight gain',
      'Ensure adequate ventilation'
    ],
    recommendationsSwahili: [
      'Lisha mara 3-4 kwa siku',
      'Ongeza kiasi cha chakula polepole',
      'Fuatilia ongezeko la uzito',
      'Hakikisha uingizaji hewa unatosha'
    ]
  },
  {
    id: 'finisher',
    name: 'Finisher Feed',
    nameSwahili: 'Chakula cha Kumalizia',
    startDay: 22,
    endDay: 999,
    color: 'bg-orange-500',
    icon: '🍗',
    description: 'Energy-rich feed for final weight gain (16-18% protein)',
    descriptionSwahili: 'Chakula chenye nishati nyingi kwa uzito wa mwisho (16-18% protini)',
    recommendations: [
      'Feed 2-3 times per day',
      'Maximum feed intake for weight',
      'Prepare for market timing',
      'Monitor market prices',
      'Plan harvest between 35-42 days'
    ],
    recommendationsSwahili: [
      'Lisha mara 2-3 kwa siku',
      'Ulaji wa juu wa chakula kwa uzito',
      'Jiandae kwa muda wa soko',
      'Fuatilia bei za soko',
      'Panga uvunaji kati ya siku 35-42'
    ]
  }
]

export default function FeedStageAlerts({ batch }: FeedStageAlertsProps) {
  const { language } = useLanguageStorage()
  const [currentDay, setCurrentDay] = useState(0)
  const [currentStage, setCurrentStage] = useState<FeedStage | null>(null)
  const [nextStage, setNextStage] = useState<FeedStage | null>(null)
  const [daysUntilChange, setDaysUntilChange] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const [hasNotified, setHasNotified] = useState(false)

  const t = {
    en: {
      title: "Feed Stage Management",
      subtitle: "Automatic feed change reminders",
      currentStage: "Current Feed Stage",
      day: "Day",
      daysRemaining: "days remaining",
      changeNow: "Change Feed Now!",
      upcomingChange: "Upcoming Feed Change",
      changeTo: "Change to",
      in: "in",
      days: "days",
      recommendations: "Recommendations",
      feedSchedule: "Feed Schedule Overview",
      acknowledge: "Got It",
      importance: "Important",
      changeMessage: "Time to change feed type!",
      ready: "Ready for",
      completed: "Stage Completed"
    },
    sw: {
      title: "Usimamizi wa Hatua za Chakula",
      subtitle: "Vikumbusho vya otomatiki vya mabadiliko ya chakula",
      currentStage: "Hatua ya Chakula ya Sasa",
      day: "Siku",
      daysRemaining: "siku zilizobaki",
      changeNow: "Badili Chakula Sasa!",
      upcomingChange: "Mabadiliko ya Chakula Yanayokuja",
      changeTo: "Badili kwenda",
      in: "katika",
      days: "siku",
      recommendations: "Mapendekezo",
      feedSchedule: "Ratiba ya Chakula kwa Muhtasari",
      acknowledge: "Nimeelewa",
      importance: "Muhimu",
      changeMessage: "Wakati wa kubadili aina ya chakula!",
      ready: "Tayari kwa",
      completed: "Hatua Imekamilika"
    }
  }[language]

  useEffect(() => {
    if (!batch.startDate) return

    const calculateCurrentDay = () => {
      const startDate = new Date(batch.startDate)
      const today = new Date()
      const diffTime = Math.abs(today.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }

    const day = calculateCurrentDay()
    setCurrentDay(day)

    // Find current stage
    const stage = FEED_STAGES.find(s => day >= s.startDay && day <= s.endDay)
    setCurrentStage(stage || FEED_STAGES[2]) // Default to finisher if beyond

    // Find next stage
    if (stage) {
      const nextStageIndex = FEED_STAGES.findIndex(s => s.id === stage.id) + 1
      if (nextStageIndex < FEED_STAGES.length) {
        const next = FEED_STAGES[nextStageIndex]
        setNextStage(next)
        const daysLeft = next.startDay - day
        setDaysUntilChange(daysLeft)

        // Show alert if within 2 days or on exact day
        if (daysLeft <= 2 && daysLeft >= 0) {
          setShowAlert(true)
          
          // Notify once per day
          if (daysLeft === 0 && !hasNotified) {
            playNotificationSound()
            toast.warning(t.changeNow, {
              description: `${t.changeTo} ${language === 'sw' ? next.nameSwahili : next.name}`,
              duration: 10000
            })
            setHasNotified(true)
          }
        }
      }
    }

    // Update every hour
    const interval = setInterval(() => {
      const newDay = calculateCurrentDay()
      setCurrentDay(newDay)
    }, 3600000) // 1 hour

    return () => clearInterval(interval)
  }, [batch.startDate, hasNotified, language])

  if (!batch.startDate || batch.status !== 'Active') {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {showAlert && daysUntilChange <= 2 && (
        <Alert className={`border-2 ${daysUntilChange === 0 ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'}`}>
          <AlertTriangle className={`h-4 w-4 ${daysUntilChange === 0 ? 'text-red-600' : 'text-orange-600'}`} />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-bold ${daysUntilChange === 0 ? 'text-red-700' : 'text-orange-700'}`}>
                  {daysUntilChange === 0 ? `🔔 ${t.changeNow}` : `⚠️ ${t.upcomingChange}`}
                </p>
                <p className="text-sm mt-1">
                  {t.changeTo} <strong>{language === 'sw' ? nextStage?.nameSwahili : nextStage?.name}</strong>
                  {daysUntilChange > 0 && ` ${t.in} ${daysUntilChange} ${t.days}`}
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowAlert(false)}
                variant={daysUntilChange === 0 ? "destructive" : "default"}
              >
                {t.acknowledge}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Stage Card */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-blue-600" />
              {t.title}
            </div>
            <Badge className="bg-blue-600 text-white">
              {t.day} {currentDay}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Current Stage Info */}
          {currentStage && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white border-2 border-blue-200 rounded-lg">
                <div className="text-4xl">{currentStage.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{language === 'sw' ? currentStage.nameSwahili : currentStage.name}</h3>
                    <Badge className={currentStage.color + ' text-white'}>
                      {t.currentStage}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {language === 'sw' ? currentStage.descriptionSwahili : currentStage.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t.day} {currentStage.startDay}-{currentStage.endDay === 999 ? `${t.ready}` : currentStage.endDay}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-sm text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {t.recommendations}:
                </h4>
                <ul className="space-y-2">
                  {(language === 'sw' ? currentStage.recommendationsSwahili : currentStage.recommendations).map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Next Stage Preview */}
          {nextStage && daysUntilChange > 0 && (
            <div className="border-t-2 border-gray-200 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-gray-600" />
                <h4 className="font-semibold text-sm text-gray-700">{t.upcomingChange}</h4>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{nextStage.icon}</div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {language === 'sw' ? nextStage.nameSwahili : nextStage.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {t.day} {nextStage.startDay}+
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{daysUntilChange}</p>
                    <p className="text-xs text-gray-600">{t.daysRemaining}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feed Schedule Timeline */}
          <div className="border-t-2 border-gray-200 pt-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">{t.feedSchedule}</h4>
            <div className="space-y-2">
              {FEED_STAGES.map((stage, idx) => {
                const isActive = currentStage?.id === stage.id
                const isPast = currentDay > stage.endDay && stage.endDay !== 999
                const isFuture = currentDay < stage.startDay

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'bg-blue-50 border-blue-400 shadow-md'
                        : isPast
                        ? 'bg-gray-50 border-gray-300 opacity-60'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="text-2xl">{stage.icon}</div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                        {language === 'sw' ? stage.nameSwahili : stage.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t.day} {stage.startDay}-{stage.endDay === 999 ? '42+' : stage.endDay}
                      </p>
                    </div>
                    {isActive && (
                      <Badge className="bg-blue-600 text-white">
                        {t.day} {currentDay}
                      </Badge>
                    )}
                    {isPast && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {isFuture && (
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


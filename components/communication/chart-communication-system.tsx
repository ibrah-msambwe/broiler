"use client"

import SimpleChatSystem from "./simple-chat-system"

interface ChartCommunicationSystemProps {
  currentUserId: string
  currentUserName: string
  isAdmin?: boolean
  batchId?: string
}

export default function ChartCommunicationSystem({ 
  currentUserId, 
  currentUserName, 
  isAdmin = false,
  batchId 
}: ChartCommunicationSystemProps) {
  return (
    <SimpleChatSystem
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      isAdmin={isAdmin}
      batchId={batchId}
    />
  )
}
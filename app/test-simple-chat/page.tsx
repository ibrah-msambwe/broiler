"use client"

import DirectChatSystem from "@/components/communication/direct-chat-system"

export default function TestSimpleChat() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          💬 Direct Chat System Test
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin Chat */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              Admin View
            </h2>
            <DirectChatSystem
              currentUserId="admin-tariq"
              currentUserName="Tariq (Admin)"
              isAdmin={true}
            />
          </div>

          {/* User Chat */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              User View
            </h2>
            <DirectChatSystem
              currentUserId="batch-user-123"
              currentUserName="Batch User"
              isAdmin={false}
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">How to Test:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Type messages in either chat box</li>
            <li>• Messages should appear immediately</li>
            <li>• System works even if database is unavailable</li>
            <li>• Professional, clean interface</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

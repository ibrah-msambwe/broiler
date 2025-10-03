"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Mail, Phone, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CommunicationComingSoon() {
  return (
    <div className="min-h-[600px] flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="max-w-2xl w-full shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg pb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-center">
            Communication System
          </CardTitle>
          <p className="text-center text-blue-100 mt-2">
            Real-time messaging and collaboration
          </p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-semibold">Currently Under Development</span>
          </div>

          {/* Main Message */}
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              The communication system is currently being developed and will be available soon.
            </p>
            <p className="text-gray-600">
              <strong>Ibrahim</strong> will notify you when the system communication is fully implemented and ready to use.
            </p>
          </div>

          {/* Features Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Planned Features:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Real-time messaging between admin and batch users</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Message history and conversation tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Notifications for new messages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>File sharing and attachments</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-center mb-4">
              Need Help or Have Questions?
            </h3>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Contact Your Admin</h4>
                  <p className="text-sm text-gray-600">For any modifications or assistance</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <User className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="font-semibold">Admin: Tariq</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">Email: tariq@admin.com</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">Contact your system administrator</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center pt-4">
            <Button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Thank you for your patience. We're working hard to bring you the best communication experience.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


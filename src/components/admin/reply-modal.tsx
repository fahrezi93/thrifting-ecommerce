'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Send, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  createdAt: string
}

interface ReplyModalProps {
  isOpen: boolean
  onClose: () => void
  contactMessage: ContactMessage | null
  onSuccess: () => void
}

export function ReplyModal({ isOpen, onClose, contactMessage, onSuccess }: ReplyModalProps) {
  const [replyMessage, setReplyMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contactMessage || !user || !replyMessage.trim()) return

    setIsLoading(true)

    try {
      const token = await user.getIdToken?.()
      if (!token) {
        alert('Authentication failed. Please try again.')
        return
      }
      
      const response = await fetch(`/api/admin/contact-messages/${contactMessage.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          replyMessage: replyMessage.trim()
        })
      })

      if (response.ok) {
        setReplyMessage('')
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to send reply'}`)
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Failed to send reply. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setReplyMessage('')
    onClose()
  }

  if (!contactMessage) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Reply to Customer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Customer Name:</Label>
                <p className="text-muted-foreground">{contactMessage.name}</p>
              </div>
              <div>
                <Label className="font-medium">Email:</Label>
                <p className="text-muted-foreground">{contactMessage.email}</p>
              </div>
            </div>
            <div>
              <Label className="font-medium">Subject:</Label>
              <p className="text-muted-foreground">{contactMessage.subject}</p>
            </div>
            <div>
              <Label className="font-medium">Original Message:</Label>
              <p className="text-muted-foreground bg-background p-3 rounded border mt-1">
                {contactMessage.message}
              </p>
            </div>
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reply">Your Reply *</Label>
              <Textarea
                id="reply"
                placeholder="Type your reply message here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
                className="mt-1"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message will be sent to {contactMessage.email}
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !replyMessage.trim()}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

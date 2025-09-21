'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, User, Calendar, MessageSquare, Reply, CheckCircle, X, Loader2, Phone } from 'lucide-react'
import { ReplyModal } from '@/components/admin/reply-modal'
import { EmailStatusIndicator } from '@/components/admin/email-status-indicator'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  user?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ContactMessagesPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [replyModal, setReplyModal] = useState<{
    isOpen: boolean
    message: ContactMessage | null
  }>({
    isOpen: false,
    message: null
  })
  const [actionLoading, setActionLoading] = useState<{
    messageId: string
    action: 'resolve' | 'close' | null
  }>({
    messageId: '',
    action: null
  })

  useEffect(() => {
    if (user) {
      fetchMessages()
    }
  }, [user, statusFilter, pagination.page])

  const fetchMessages = async () => {
    try {
      if (!user) return
      
      const token = await user.getIdToken?.()
      if (!token) return
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      const response = await fetch(`/api/contact?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PENDING: 'destructive',
      IN_PROGRESS: 'default',
      RESOLVED: 'secondary',
      CLOSED: 'outline'
    }
    
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleReply = (message: ContactMessage) => {
    setReplyModal({
      isOpen: true,
      message
    })
  }

  const handleMarkAsResolved = async (messageId: string) => {
    if (!user) return

    setActionLoading({ messageId, action: 'resolve' })

    try {
      const token = await user.getIdToken?.()
      if (!token) return

      const response = await fetch(`/api/admin/contact-messages/${messageId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchMessages() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.error || 'Failed to mark as resolved'}`)
      }
    } catch (error) {
      console.error('Error marking as resolved:', error)
      toast.error('Failed to mark as resolved. Please try again.')
    } finally {
      setActionLoading({ messageId: '', action: null })
    }
  }

  const handleClose = async (messageId: string) => {
    if (!user) return

    setActionLoading({ messageId, action: 'close' })

    try {
      const token = await user.getIdToken?.()
      if (!token) return

      const response = await fetch(`/api/admin/contact-messages/${messageId}/close`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchMessages() // Refresh the list
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.error || 'Failed to close message'}`)
      }
    } catch (error) {
      console.error('Error closing message:', error)
      toast.error('Failed to close message. Please try again.')
    } finally {
      setActionLoading({ messageId: '', action: null })
    }
  }

  const handleReplySuccess = () => {
    fetchMessages() // Refresh the list after successful reply
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading contact messages...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Contact Messages</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage customer inquiries and support requests
        </p>
      </div>

      {/* Email Status Indicator */}
      <EmailStatusIndicator />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {pagination.total} total messages
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6 sm:py-8">
              <MessageSquare className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No messages found</h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter === 'all' 
                  ? 'No contact messages have been received yet.'
                  : `No messages with status "${statusFilter}" found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className="overflow-hidden">
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
                <div className="space-y-3">
                  {/* Title and Status Row */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm sm:text-base md:text-lg line-clamp-2 flex-1 min-w-0 leading-tight">
                        {message.subject}
                      </CardTitle>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getStatusBadge(message.status)}
                      </div>
                    </div>
                    {message.user && (
                      <Badge variant="outline" className="text-xs w-fit">Registered User</Badge>
                    )}
                  </div>
                  
                  {/* Contact Info - Mobile Optimized */}
                  <div className="text-muted-foreground space-y-2">
                    <div className="grid grid-cols-1 gap-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{message.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{message.email}</span>
                      </div>
                      {message.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{message.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{formatDate(message.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {/* Message Content */}
                <div className="bg-muted p-3 rounded-lg mb-3 sm:mb-4">
                  <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {message.message}
                  </p>
                </div>
                
                {message.user && (
                  <div className="text-xs text-muted-foreground mb-3 sm:mb-4 p-2 bg-blue-50 rounded text-center sm:text-left">
                    <strong>User:</strong> {message.user.name} ({message.user.email})
                  </div>
                )}
                
                {/* Action Buttons - Mobile First */}
                <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-9 text-xs sm:text-sm"
                    onClick={() => handleReply(message)}
                    disabled={message.status === 'CLOSED'}
                  >
                    <Reply className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Reply
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-9 text-xs sm:text-sm"
                    onClick={() => handleMarkAsResolved(message.id)}
                    disabled={message.status === 'RESOLVED' || message.status === 'CLOSED' || 
                             (actionLoading.messageId === message.id && actionLoading.action === 'resolve')}
                  >
                    {actionLoading.messageId === message.id && actionLoading.action === 'resolve' ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    )}
                    Resolve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-9 text-xs sm:text-sm"
                    onClick={() => handleClose(message.id)}
                    disabled={message.status === 'CLOSED' || 
                             (actionLoading.messageId === message.id && actionLoading.action === 'close')}
                  >
                    {actionLoading.messageId === message.id && actionLoading.action === 'close' ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                    ) : (
                      <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    )}
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex flex-col items-center gap-3 mt-6 sm:mt-8">
          <div className="flex items-center justify-center gap-1 sm:gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="px-2 sm:px-3 text-xs sm:text-sm h-8 sm:h-9"
            >
              Prev
            </Button>
            
            <div className="flex items-center gap-1 overflow-x-auto max-w-[150px] sm:max-w-none">
              {Array.from({ length: Math.min(pagination.pages, 3) }, (_, i) => {
                let page;
                if (pagination.pages <= 3) {
                  page = i + 1;
                } else if (pagination.page <= 2) {
                  page = i + 1;
                } else if (pagination.page >= pagination.pages - 1) {
                  page = pagination.pages - 2 + i;
                } else {
                  page = pagination.page - 1 + i;
                }
                
                return (
                  <Button
                    key={page}
                    variant={page === pagination.page ? "default" : "outline"}
                    size="sm"
                    className="w-7 h-8 sm:w-8 sm:h-9 p-0 flex-shrink-0 text-xs sm:text-sm"
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-2 sm:px-3 text-xs sm:text-sm h-8 sm:h-9"
            >
              Next
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Page {pagination.page} of {pagination.pages}
          </div>
        </div>
      )}

      {/* Reply Modal */}
      <ReplyModal
        isOpen={replyModal.isOpen}
        onClose={() => setReplyModal({ isOpen: false, message: null })}
        contactMessage={replyModal.message}
        onSuccess={handleReplySuccess}
      />
    </div>
  )
}

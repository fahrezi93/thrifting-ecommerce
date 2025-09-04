import { NextRequest, NextResponse } from 'next/server'

// Store for active SSE connections
const connections = new Set<ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  // Create Server-Sent Events stream
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to active connections
      connections.add(controller)
      
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      
      // Clean up when connection closes
      request.signal.addEventListener('abort', () => {
        connections.delete(controller)
        try {
          controller.close()
        } catch (e) {
          // Connection already closed
        }
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()
    
    if (type === 'STORE_STATUS_CHANGED') {
      // Broadcast to all connected clients
      const message = `data: ${JSON.stringify({ type, data })}\n\n`
      
      connections.forEach(controller => {
        try {
          controller.enqueue(message)
        } catch (e) {
          // Remove dead connections
          connections.delete(controller)
        }
      })
      
      console.log(`Broadcasted store status change to ${connections.size} clients`)
      return NextResponse.json({ success: true, clients: connections.size })
    }
    
    return NextResponse.json({ error: 'Invalid message type' }, { status: 400 })
  } catch (error) {
    console.error('Error broadcasting message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

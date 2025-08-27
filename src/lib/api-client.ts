import { auth } from './firebase'

class ApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (auth?.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken()
        headers['Authorization'] = `Bearer ${token}`
      } catch (error) {
        console.error('Failed to get auth token:', error)
      }
    }

    return headers
  }

  async get(url: string) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async post(url: string, data?: any) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async put(url: string, data?: any) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async delete(url: string) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()

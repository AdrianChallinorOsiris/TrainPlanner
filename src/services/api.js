const API_BASE_URL = 'http://pi:5000'
const HEALTH_CHECK_TIMEOUT = 3000

export const api = {
  async healthCheck() {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT)
    
    try {
      const response = await fetch(`${API_BASE_URL}/API/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (response.ok) {
        return { success: true, data: await response.json() }
      }
      return { success: false, error: `HTTP ${response.status}` }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        return { success: false, error: 'Connection timeout' }
      }
      if (error.name === 'TypeError') {
        return { success: false, error: 'Connection failed' }
      }
      return { success: false, error: error.message }
    }
  }
}

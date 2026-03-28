const API_BASE_URL = 'http://192.168.1.80:5000/api'
const HEALTH_CHECK_TIMEOUT = 3000
/**
 * Evolve endpoint: same-origin `/evolve` in dev (Vite proxies to 127.0.0.1:8080) to avoid CORS.
 * Set VITE_EVOLVE_URL in .env for production builds if the app is not served behind a matching proxy.
 */
const EVOLVE_URL =
  typeof import.meta.env.VITE_EVOLVE_URL === 'string' && import.meta.env.VITE_EVOLVE_URL
    ? import.meta.env.VITE_EVOLVE_URL
    : '/evolve'

/** Open in browser; dev uses Vite proxy to localhost:8080. Override with VITE_* for production. */
export const ROADMAP_URL =
  typeof import.meta.env.VITE_ROADMAP_URL === 'string' && import.meta.env.VITE_ROADMAP_URL
    ? import.meta.env.VITE_ROADMAP_URL
    : '/roadmap'

export const JOURNAL_URL =
  typeof import.meta.env.VITE_JOURNAL_URL === 'string' && import.meta.env.VITE_JOURNAL_URL
    ? import.meta.env.VITE_JOURNAL_URL
    : '/journal'

export const api = {
  async healthCheck() {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT)
    
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
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
  },
  async reset() {
    const response = await fetch(`${API_BASE_URL}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { success: true }
  },
  async allStop() {
    const response = await fetch(`${API_BASE_URL}/tracks/allstop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { success: true }
  },
  async ledTest() {
    const response = await fetch(`${API_BASE_URL}/leds/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { success: true }
  },
  async setPointDirection(groupId, direction) {
    const response = await fetch(
      `${API_BASE_URL}/points/${groupId}?direction=${encodeURIComponent(direction)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { success: true }
  },
  async setTrackSpeed(trackId, speed, direction) {
    const response = await fetch(
      `${API_BASE_URL}/tracks/${trackId}/speed?speed=${encodeURIComponent(
        speed
      )}&direction=${encodeURIComponent(direction)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { success: true }
  },
  async setTrackSpeedOnly(trackId, speed, direction) {
    const response = await fetch(
      `${API_BASE_URL}/tracks/${trackId}/speed?speed=${encodeURIComponent(
        speed
      )}&direction=${encodeURIComponent(direction)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { success: true }
  },
  async setSensorValue(sensorId, value) {
    const response = await fetch(
      `${API_BASE_URL}/sensors/${sensorId}?value=${encodeURIComponent(value)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { success: true }
  },
  async setTrackHold(trackId, held) {
    const response = await fetch(
      `${API_BASE_URL}/tracks/${trackId}/hold?held=${encodeURIComponent(held)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { success: true }
  },
  async getStatus() {
    const response = await fetch(`${API_BASE_URL}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  },
  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  },
  async getTrackStatus() {
    const response = await fetch(`${API_BASE_URL}/tracks/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  },
  async shutdown() {
    const response = await fetch(`${API_BASE_URL}/shutdown`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { success: true }
  },
  async restart() {
    const response = await fetch(`${API_BASE_URL}/restart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return { success: true }
  },
  /**
   * POST to Bastet evolve endpoint. May take many minutes; pass AbortSignal for cancel/timeout.
   * @param {{ signal?: AbortSignal }} [options]
   */
  async evolve(options = {}) {
    const response = await fetch(EVOLVE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: options.signal
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        text ? `HTTP ${response.status}: ${text.slice(0, 300)}` : `HTTP ${response.status}`
      )
    }
    return response.json()
  },
  /**
   * GET roadmap JSON { path, text } from Bastet (dev: Vite proxy).
   */
  async fetchRoadmapDoc() {
    const response = await fetch(ROADMAP_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        text ? `HTTP ${response.status}: ${text.slice(0, 300)}` : `HTTP ${response.status}`
      )
    }
    return response.json()
  },
  /**
   * GET journal JSON { path, text } from Bastet (dev: Vite proxy).
   */
  async fetchJournalDoc() {
    const response = await fetch(JOURNAL_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        text ? `HTTP ${response.status}: ${text.slice(0, 300)}` : `HTTP ${response.status}`
      )
    }
    return response.json()
  }
}

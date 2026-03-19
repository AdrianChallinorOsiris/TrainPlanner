<template>
  <div class="app-shell">
    <div class="button-bar">
      <button class="bar-button" @click="handleReset">Reset</button>
      <button class="bar-button" @click="handleAllStop">All Stop</button>
      <button class="bar-button" @click="handleHealth">Health</button>
      <button class="bar-button" @click="handleStatus">Status</button>
      <button class="bar-button" @click="handleShutdown">Shutdown</button>
      <button class="bar-button" @click="handleRestart">Restart</button>
      <button class="bar-button" @click="handleAbout">About</button>
    </div>

    <div class="app-container">
      <div class="tab-bar">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'track' }"
          @click="activeTab = 'track'"
        >
          Track Layout
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'control' }"
          @click="activeTab = 'control'"
        >
          Track Controls
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'commands' }"
          @click="activeTab = 'commands'"
        >
          Commands
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'track'" class="svg-pane">
          <div class="svg-label">Layout</div>
          <svg viewBox="0 0 2000 2400" width="100%" height="100%">
            <TrackLayout
              :sections-state="sections"
              :sensors-state="sensors"
              :point-groups-state="pointGroups"
              @track-click="openTrackDialog"
            />
          </svg>
        </div>
        <div v-else-if="activeTab === 'control'" class="panes-container">
          <SectionsPane :sections="sections" />
          <PointsPane :point-groups="pointGroups" />
          <SensorsPane :sensors="sensors" />
        </div>
        <CommandsPane v-else />
      </div>

      <div class="log-container">
        <div class="log-pane">
          <LogWindow ref="logWindowRef" />
        </div>
        <div class="status-pane">
          <h3>Track Status</h3>
          <div class="indicator-status">
            <div class="indicator-row indicator-row-connected">
              <div
                class="indicator-box"
                :style="{ backgroundColor: connectedIndicator.color, color: connectedIndicator.textColor }"
                :title="connectedIndicator.value"
              >
                {{ connectedIndicator.label }}
              </div>
            </div>
            <div v-if="trackIndicatorEntries.length" class="indicator-row indicator-row-tracks">
              <div
                v-for="indicator in trackIndicatorEntries"
                :key="indicator.key"
                class="indicator-box"
                :class="{ off: indicator.isOff }"
                :style="indicator.isOff ? null : { backgroundColor: indicator.color, color: indicator.textColor }"
                :title="indicator.value"
              >
                {{ indicator.label }}
              </div>
            </div>
          </div>
          <div v-if="!trackIndicatorEntries.length" class="status-placeholder">No track indicators reported.</div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Track Control Dialog -->
  <div v-if="showTrackDialog" class="dialog-overlay" @click.self="closeTrackDialog">
    <div class="dialog track-control-dialog">
      <h2>Track {{ trackDialogSection?.id }}</h2>
      <div v-if="trackDialogSection" class="track-control-form">
        <label class="track-control-field">
          <span class="track-control-label">Direction</span>
          <select
            v-model="trackDialogSection.direction"
            class="direction-select"
            :class="{
              'direction-forward': trackDialogSection.direction === 'forward',
              'direction-backwards': trackDialogSection.direction === 'backwards',
              'direction-off': trackDialogSection.direction === 'off'
            }"
          >
            <option value="off">Off</option>
            <option value="forward">Forward</option>
            <option value="backwards">Backwards</option>
          </select>
        </label>
        <div class="track-control-field speed-buttons-field">
          <span class="track-control-label">Speed</span>
          <div class="speed-buttons-grid">
            <button
              v-for="preset in SPEED_PRESETS"
              :key="preset"
              type="button"
              class="speed-button"
              :class="{ selected: trackDialogSection.direction !== 'off' && trackDialogSection.speed === preset }"
              :disabled="trackDialogSection.direction === 'off'"
              @click="trackDialogSection.direction !== 'off' ? trackDialogSection.speed = preset : null"
            >
              {{ preset }}%
            </button>
          </div>
        </div>
      </div>
      <button @click="closeTrackDialog" class="dialog-button">Close</button>
    </div>
  </div>
  
  <!-- Simulation Mode Dialog -->
  <div v-if="showSimulationDialog" class="dialog-overlay" @click.self="closeSimulationDialog">
    <div class="dialog">
      <h2>Simulation Mode</h2>
      <p>Unable to connect to Raspberry Pi at pi:5000</p>
      <p>Running in <strong>simulation mode</strong>, not live mode.</p>
      <button @click="closeSimulationDialog" class="dialog-button">OK</button>
    </div>
  </div>

  <!-- Connected Dialog (disabled for now) -->

  <!-- Health Dialog -->
  <div v-if="showHealthDialog" class="dialog-overlay" @click.self="closeHealthDialog">
    <div class="dialog health-dialog">
      <h2>Health</h2>
      <div class="health-list">
        <div
          v-for="item in healthDetails"
          :key="item.key"
          class="health-row"
        >
          <span class="health-key">{{ item.key }}</span>
          <span class="health-value">{{ item.value }}</span>
        </div>
      </div>
      <button @click="closeHealthDialog" class="dialog-button">OK</button>
    </div>
  </div>

  <!-- Status Dialog -->
  <div v-if="showStatusDialog" class="dialog-overlay" @click.self="closeStatusDialog">
    <div class="dialog status-dialog">
      <h2>Status</h2>
      <div v-if="heldCount > 0" class="status-list">
        <div v-for="(entry, index) in heldTracks" :key="`held-${index}`" class="status-row">
          {{ entry }}
        </div>
      </div>
      <p v-else class="status-empty">No tracks are held.</p>
      <button @click="closeStatusDialog" class="dialog-button">OK</button>
    </div>
  </div>

  <!-- About Dialog -->
  <div v-if="showAboutDialog" class="dialog-overlay" @click.self="closeAboutDialog">
    <div class="dialog">
      <h2>About</h2>
      <div class="about-list">
        <div class="about-row">
          <span class="about-key">Version</span>
          <span class="about-value">{{ versionInfo.version || 'Unknown' }}</span>
        </div>
        <div class="about-row">
          <span class="about-key">Last Commit</span>
          <span class="about-value">{{ versionInfo.lastCommitMessage || 'Not set' }}</span>
        </div>
        <div class="about-row">
          <span class="about-key">Commit Time</span>
          <span class="about-value">{{ versionInfo.lastCommitAt || 'Not set' }}</span>
        </div>
      </div>
      <button @click="closeAboutDialog" class="dialog-button">OK</button>
    </div>
  </div>

  <!-- Shutdown Dialog -->
  <div v-if="showShutdownDialog" class="dialog-overlay" @click.self="closeShutdownDialog">
    <div class="dialog">
      <h2>Confirm Shutdown</h2>
      <p>Are you sure you want to shut down the controller?</p>
      <div class="dialog-actions">
        <button @click="closeShutdownDialog" class="dialog-button secondary">Cancel</button>
        <button @click="confirmShutdown" class="dialog-button">Shutdown</button>
      </div>
    </div>
  </div>

  <!-- Restart Dialog -->
  <div v-if="showRestartDialog" class="dialog-overlay" @click.self="closeRestartDialog">
    <div class="dialog">
      <h2>Confirm Restart</h2>
      <p>Are you sure you want to restart the controller?</p>
      <div class="dialog-actions">
        <button @click="closeRestartDialog" class="dialog-button secondary">Cancel</button>
        <button @click="confirmRestart" class="dialog-button">Restart</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, provide, watch } from 'vue'
import SectionsPane from './components/SectionsPane.vue'
import PointsPane from './components/PointsPane.vue'
import SensorsPane from './components/SensorsPane.vue'
import CommandsPane from './components/CommandsPane.vue'
import LogWindow from './components/LogWindow.vue'
import TrackLayout from './components/TrackLayout.vue'
import { api } from './services/api'
import { getTrackSection } from './utils/trackData'
import versionInfo from './version.json'

const SPEED_PRESETS = [5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100]
function closestSpeedPreset(speed) {
  if (speed == null || speed === 0) return 0
  return SPEED_PRESETS.reduce((a, b) =>
    Math.abs(a - speed) <= Math.abs(b - speed) ? a : b
  )
}

const logWindowRef = ref(null)
const showSimulationDialog = ref(false)
const showConnectedDialog = ref(false)
const liveMode = ref(false)
const isCompact = ref(false)
const activeTab = ref('track')
const showHealthDialog = ref(false)
const healthDetails = ref([])
const showStatusDialog = ref(false)
const heldTracks = ref([])
const heldCount = ref(0)
const indicators = ref({})
const showTrackDialog = ref(false)
const trackDialogSectionId = ref(null)
const showShutdownDialog = ref(false)
const showRestartDialog = ref(false)
const showAboutDialog = ref(false)
const isApplyingStatus = ref(false)
const statusIntervalId = ref(null)
const piStatusConnected = ref(false)
const trackDialogSection = computed(() => {
  if (trackDialogSectionId.value === null) {
    return null
  }
  return sections.value.find(section => section.id === trackDialogSectionId.value) || null
})

const connectedIndicator = computed(() => ({
  key: 'connected',
  label: 'Connected',
  value: piStatusConnected.value ? 'Connected' : 'Not Connected',
  color: piStatusConnected.value ? '#43a047' : '#e53935',
  isOff: false,
  textColor: '#ffffff'
}))

const trackIndicatorEntries = computed(() => {
  const entries = Object.entries(indicators.value || {}).map(([key, value]) => {
    const mapped = mapIndicatorColor(value)
    const match = String(key).match(/track[\s_]*(\d+)/i)
    const trackNum = match ? parseInt(match[1], 10) : null
    return {
      key,
      label: formatIndicatorLabel(key),
      value: value ?? 'OFF',
      color: mapped?.css || null,
      isOff: !mapped,
      textColor: mapped ? getIndicatorTextColor(mapped.name) : null,
      trackNum
    }
  })
  return entries.sort((a, b) => {
    if (a.trackNum != null && b.trackNum != null) return a.trackNum - b.trackNum
    if (a.trackNum != null) return -1
    if (b.trackNum != null) return 1
    return String(a.key).localeCompare(b.key)
  })
})

// Sections state - shared between SectionsPane and TrackLayout
const sections = ref(
  Array.from({ length: 12 }, (_, i) => {
    const id = i + 1
    const sectionDef = getTrackSection(id)
    return {
      id,
      name: sectionDef?.name || '',
      direction: 'off',
      held: false,
      speed: 10
    }
  })
)
const previousSectionDirections = ref(new Map())
const previousSectionSpeeds = ref(new Map())
const previousHeldSections = ref(new Map())

// Point groups state - shared between PointsPane and TrackLayout
const pointGroups = ref(
  Array.from({ length: 13 }, (_, i) => ({
    id: i + 1,
    type: 'thru'
  }))
)
const previousPointGroups = ref(new Map())

// Sensors state - shared between SensorsPane and TrackLayout
const sensors = ref(
  Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    set: false,
    disabled: false
  }))
)
const previousSensors = ref(new Map())

const closeSimulationDialog = () => {
  showSimulationDialog.value = false
}

const updateLayoutMode = () => {
  isCompact.value = window.matchMedia('(max-width: 1200px)').matches
}

const handleReset = async () => {
  if (!liveMode.value) {
    return
  }
  try {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage('Reset button pressed')
    }
    await api.reset()
    if (logWindowRef.value) {
      logWindowRef.value.addMessage('Reset command sent')
    }
  } catch (error) {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage(`Reset failed: ${error.message}`)
    }
  }
}

const handleAllStop = async () => {
  if (!liveMode.value) {
    return
  }
  try {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage('All Stop button pressed')
    }
    await api.allStop()
    if (logWindowRef.value) {
      logWindowRef.value.addMessage('All Stop command sent')
    }
  } catch (error) {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage(`All Stop failed: ${error.message}`)
    }
  }
}

const handleLedTest = async () => {
  if (!liveMode.value) {
    return
  }
  try {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage('LED Test button pressed')
    }
    await api.ledTest()
    if (logWindowRef.value) {
      logWindowRef.value.addMessage('LED test command sent')
    }
  } catch (error) {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage(`LED test failed: ${error.message}`)
    }
  }
}

const handleHealth = async () => {
  try {
    const payload = await api.getHealth()
    const entries = Object.entries(payload || {})
      .filter(([key]) => key !== 'status' && key !== 'success')
      .map(([key, value]) => ({ key, value }))
    healthDetails.value = entries
    showHealthDialog.value = true
  } catch (error) {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage(`Health check failed: ${error.message}`)
    }
  }
}

const handleStatus = async () => {
  try {
    const response = await api.getTrackStatus()
    const payload = response?.data || response || {}
    const tracks = Array.isArray(payload.held_tracks) ? payload.held_tracks : []
    heldTracks.value = tracks
    heldCount.value = Number.isFinite(Number(payload.count))
      ? Number(payload.count)
      : tracks.length
    showStatusDialog.value = true
  } catch (error) {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage(`Status check failed: ${error.message}`)
    }
  }
}

const handleAbout = () => {
  showAboutDialog.value = true
}

const closeAboutDialog = () => {
  showAboutDialog.value = false
}

const handleShutdown = async () => {
  if (!liveMode.value) {
    return
  }
  showShutdownDialog.value = true
}

const handleRestart = async () => {
  if (!liveMode.value) {
    return
  }
  showRestartDialog.value = true
}

const confirmShutdown = async () => {
  showShutdownDialog.value = false
  try {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage('Shutdown button pressed')
    }
    await api.shutdown()
    if (logWindowRef.value) {
      logWindowRef.value.addMessage('Shutdown command sent')
    }
  } catch (error) {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage(`Shutdown failed: ${error.message}`)
    }
  }
}

const confirmRestart = async () => {
  showRestartDialog.value = false
  try {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage('Restart button pressed')
    }
    await api.restart()
    if (logWindowRef.value) {
      logWindowRef.value.addMessage('Restart command sent')
    }
  } catch (error) {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage(`Restart failed: ${error.message}`)
    }
  }
}

const closeShutdownDialog = () => {
  showShutdownDialog.value = false
}

const closeRestartDialog = () => {
  showRestartDialog.value = false
}

const closeHealthDialog = () => {
  showHealthDialog.value = false
}

const closeStatusDialog = () => {
  showStatusDialog.value = false
}

const openTrackDialog = (sectionId) => {
  trackDialogSectionId.value = sectionId
  showTrackDialog.value = true
}

const closeTrackDialog = () => {
  showTrackDialog.value = false
}

const checkHealth = async () => {
  if (logWindowRef.value) {
    logWindowRef.value.addMessage('Checking connection to Raspberry Pi...')
  }
  
  const result = await api.healthCheck()
  liveMode.value = result.success
  
  if (result.success) {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage('Connected to Raspberry Pi - Running in LIVE mode')
    }
  } else {
    if (logWindowRef.value) {
      logWindowRef.value.addMessage(`Connection failed: ${result.error} - Running in SIMULATION mode`)
    }
    showSimulationDialog.value = true
  }
}

const mapTrackDirection = (value) => {
  if (!value) return null
  const v = String(value).toLowerCase()
  if (v === 'fwd' || v === 'forward') return 'forward'
  if (v === 'bck' || v === 'bwd' || v === 'backwards' || v === 'reverse') return 'backwards'
  if (v === 'off') return 'off'
  return null
}

const mapPointGroupType = (value) => {
  if (!value) return null
  const v = String(value).toLowerCase()
  if (v === 'thru') return 'thru'
  if (v === 'branch') return 'branch'
  return null
}

const mapIndicatorColor = (value) => {
  if (!value) return null
  const v = String(value).toUpperCase()
  if (v === 'OFF') return null
  const map = {
    RED: '#e53935',
    GREEN: '#43a047',
    YELLOW: '#fdd835',
    AMBER: '#ffb300',
    BLUE: '#1e88e5',
    MAGENTA: '#d81b60',
    CYAN: '#00acc1',
    WHITE: '#ffffff',
    ORANGE: '#fb8c00',
    GRAY: '#9e9e9e',
    BLACK: '#000000'
  }
  return { name: v.toLowerCase(), css: map[v] || v.toLowerCase() }
}

const formatIndicatorLabel = (key) => {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/track\s*(\d+)/gi, 'Track $1')
    .replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

const getIndicatorTextColor = (color) => {
  const darkColors = new Set([
    'black',
    'blue',
    'magenta',
    'red',
    'green',
    'gray'
  ])
  return darkColors.has(color) ? '#ffffff' : '#111111'
}

const applyStatusUpdate = (status) => {
  if (!status) return
  isApplyingStatus.value = true
  const payload = status.data || status

  if (payload.tracks && typeof payload.tracks === 'object') {
    for (const [key, entry] of Object.entries(payload.tracks)) {
      const id = Number(key)
      const section = sections.value.find(s => s.id === id)
      if (!section || !entry) continue
      const mappedDirection = mapTrackDirection(entry.direction)
      if (mappedDirection) {
        section.direction = mappedDirection
      }
      if (mappedDirection === 'off') {
        section.speed = 0
      } else if (entry.speed !== undefined && entry.speed !== null) {
        section.speed = closestSpeedPreset(entry.speed)
      }
      if (entry.held !== undefined) {
        section.held = Boolean(entry.held)
      }
    }
  }

  if (payload.points && typeof payload.points === 'object') {
    for (const [key, entry] of Object.entries(payload.points)) {
      const groupId = Number(key)
      const group = pointGroups.value.find(g => g.id === groupId)
      if (!group || !entry) continue
      const mappedType = mapPointGroupType(entry.direction)
      if (mappedType) {
        group.type = mappedType
      }
    }
  }

  if (typeof payload.sensors === 'number') {
    const mask = payload.sensors
    for (const sensor of sensors.value) {
      const bit = 1 << (sensor.id - 1)
      sensor.set = (mask & bit) !== 0
    }
  }

  if (payload.indicators && typeof payload.indicators === 'object') {
    indicators.value = payload.indicators
  }

  // Sync previous maps to avoid outbound commands for status updates
  const nextDirectionMap = new Map()
  const nextSpeedMap = new Map()
  const nextHeldMap = new Map()
  for (const section of sections.value) {
    nextDirectionMap.set(section.id, section.direction)
    nextSpeedMap.set(section.id, section.speed)
    nextHeldMap.set(section.id, section.held)
  }
  previousSectionDirections.value = nextDirectionMap
  previousSectionSpeeds.value = nextSpeedMap
  previousHeldSections.value = nextHeldMap

  const nextPointMap = new Map()
  for (const group of pointGroups.value) {
    nextPointMap.set(group.id, group.type)
  }
  previousPointGroups.value = nextPointMap

  const nextSensorMap = new Map()
  for (const sensor of sensors.value) {
    nextSensorMap.set(sensor.id, sensor.set)
  }
  previousSensors.value = nextSensorMap

  isApplyingStatus.value = false
}

const pollStatus = async () => {
  try {
    const status = await api.getStatus()
    applyStatusUpdate(status)
    piStatusConnected.value = true
  } catch (error) {
    piStatusConnected.value = false
  }
}

watch(
  pointGroups,
  async (newGroups) => {
    if (isApplyingStatus.value) {
      return
    }
    if (!liveMode.value) {
      return
    }
    const prevMap = previousPointGroups.value
    const nextMap = new Map()
    for (const group of newGroups) {
      nextMap.set(group.id, group.type)
      const prevType = prevMap.get(group.id)
      if (prevType && prevType === group.type) {
        continue
      }
      if (!prevType) {
        continue
      }
      const direction = group.type === 'thru' ? 'THRU' : 'BRANCH'
      try {
        if (logWindowRef.value) {
          logWindowRef.value.addMessage(
            `Point group ${group.id} set to ${direction}`
          )
        }
        await api.setPointDirection(group.id, direction)
      } catch (error) {
        if (logWindowRef.value) {
          logWindowRef.value.addMessage(
            `Point group ${group.id} update failed: ${error.message}`
          )
        }
      }
    }
    previousPointGroups.value = nextMap
  },
  { deep: true }
)

watch(liveMode, (isLive) => {
  if (!isLive) {
    return
  }
  const nextMap = new Map()
  for (const group of pointGroups.value) {
    nextMap.set(group.id, group.type)
  }
  previousPointGroups.value = nextMap
})

watch(
  sections,
  async (newSections) => {
    if (isApplyingStatus.value) {
      return
    }
    const prevHeldMap = previousHeldSections.value
    const nextHeldMap = new Map()
    for (const section of newSections) {
      nextHeldMap.set(section.id, section.held)
      const prevHeld = prevHeldMap.get(section.id)
      if (prevHeld !== undefined && prevHeld !== section.held) {
        if (logWindowRef.value) {
          logWindowRef.value.addMessage(
            `Track ${section.id} hold ${section.held ? 'ON' : 'OFF'}`
          )
        }
        if (liveMode.value) {
          try {
            await api.setTrackHold(section.id, section.held ? 'true' : 'false')
          } catch (error) {
            if (logWindowRef.value) {
              logWindowRef.value.addMessage(
                `Track ${section.id} hold update failed: ${error.message}`
              )
            }
          }
        }
      }
    }
    previousHeldSections.value = nextHeldMap

    if (!liveMode.value) {
      return
    }
    const prevDirectionMap = previousSectionDirections.value
    const prevSpeedMap = previousSectionSpeeds.value
    const nextDirectionMap = new Map()
    const nextSpeedMap = new Map()
    for (const section of newSections) {
      nextDirectionMap.set(section.id, section.direction)
      nextSpeedMap.set(section.id, section.speed)

      const prevDirection = prevDirectionMap.get(section.id)
      const prevSpeed = prevSpeedMap.get(section.id)
      if (prevDirection === undefined) {
        continue
      }

      const directionChanged = prevDirection !== section.direction
      const speedChanged = prevSpeed !== section.speed
      if (!directionChanged && !speedChanged) {
        continue
      }

      if (section.direction === 'off') {
        if (directionChanged) {
          section.speed = 0
          try {
            if (logWindowRef.value) {
              logWindowRef.value.addMessage(
                `Track ${section.id} set to OFF`
              )
            }
            await api.setTrackSpeed(section.id, 0, 'OFF')
          } catch (error) {
            if (logWindowRef.value) {
              logWindowRef.value.addMessage(
                `Track ${section.id} update failed: ${error.message}`
              )
            }
          }
        }
        continue
      }

      if (directionChanged && prevDirection === 'off') {
        section.speed = 5
      }
      const direction =
        section.direction === 'forward'
          ? 'FWD'
          : 'BCK'
      const speed = Math.min(100, Math.max(0, section.speed ?? 10))
      try {
        if (logWindowRef.value) {
          const message = directionChanged
            ? `Track ${section.id} set to ${direction} speed ${speed}`
            : `Track ${section.id} speed set to ${speed}`
          logWindowRef.value.addMessage(message)
        }
        if (directionChanged) {
          await api.setTrackSpeed(section.id, speed, direction)
        } else if (speedChanged) {
          await api.setTrackSpeedOnly(section.id, speed, direction)
        }
      } catch (error) {
        if (logWindowRef.value) {
          logWindowRef.value.addMessage(
            `Track ${section.id} update failed: ${error.message}`
          )
        }
      }
    }
    previousSectionDirections.value = nextDirectionMap
    previousSectionSpeeds.value = nextSpeedMap
  },
  { deep: true }
)

watch(liveMode, (isLive) => {
  if (!isLive) {
    return
  }
  const nextDirectionMap = new Map()
  const nextSpeedMap = new Map()
  for (const section of sections.value) {
    nextDirectionMap.set(section.id, section.direction)
    nextSpeedMap.set(section.id, section.speed)
  }
  previousSectionDirections.value = nextDirectionMap
  previousSectionSpeeds.value = nextSpeedMap
})

watch(liveMode, (isLive) => {
  if (!isLive) {
    return
  }
  const nextHeldMap = new Map()
  for (const section of sections.value) {
    nextHeldMap.set(section.id, section.held)
  }
  previousHeldSections.value = nextHeldMap
})

watch(
  sensors,
  async (newSensors) => {
    if (isApplyingStatus.value) {
      return
    }
    if (!liveMode.value) {
      return
    }
    const prevMap = previousSensors.value
    const nextMap = new Map()
    for (const sensor of newSensors) {
      nextMap.set(sensor.id, sensor.set)
      const prevValue = prevMap.get(sensor.id)
      if (prevValue !== undefined && prevValue === sensor.set) {
        continue
      }
      if (prevValue === undefined) {
        continue
      }
      const value = sensor.set ? 'true' : 'false'
      try {
        if (logWindowRef.value) {
          logWindowRef.value.addMessage(
            `Sensor ${sensor.id} set to ${value}`
          )
        }
        await api.setSensorValue(sensor.id, value)
      } catch (error) {
        if (logWindowRef.value) {
          logWindowRef.value.addMessage(
            `Sensor ${sensor.id} update failed: ${error.message}`
          )
        }
      }
    }
    previousSensors.value = nextMap
  },
  { deep: true }
)

watch(liveMode, (isLive) => {
  if (!isLive) {
    return
  }
  const nextMap = new Map()
  for (const sensor of sensors.value) {
    nextMap.set(sensor.id, sensor.set)
  }
  previousSensors.value = nextMap
})

provide('liveMode', liveMode)

onMounted(() => {
  updateLayoutMode()
  window.addEventListener('resize', updateLayoutMode)
  window.addEventListener('orientationchange', updateLayoutMode)
  checkHealth()
  pollStatus()
  statusIntervalId.value = setInterval(pollStatus, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateLayoutMode)
  window.removeEventListener('orientationchange', updateLayoutMode)
  if (statusIntervalId.value) {
    clearInterval(statusIntervalId.value)
  }
})
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.button-bar {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 10px;
  border-bottom: 1px solid #ddd;
  background-color: #f5f5f5;
}

.bar-button {
  padding: 0.35rem 0.9rem;
  border: 1px solid #ccc;
  background-color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.bar-button:hover {
  background-color: #f0f0f0;
}

.app-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #ddd;
  background-color: #f5f5f5;
  flex-wrap: wrap;
}

.tab-button {
  padding: 0.35rem 0.75rem;
  border: 1px solid #ccc;
  background-color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.tab-button.active {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.tab-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.svg-pane {
  flex: 1;
  min-height: 0;
  border-bottom: 1px solid #ddd;
  background-color: #f9f9f9;
  position: relative;
  width: 100%;
  align-self: stretch;
}

.svg-label {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: #333;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
}

.svg-pane svg {
  display: block;
  background-color: white;
  width: 100%;
  height: 100%;
}

.panes-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
}

.log-container {
  flex: 0 0 200px;
  min-height: 200px;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
}

.log-pane,
.status-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.status-pane {
  background-color: #1e1e1e;
  color: #d4d4d4;
  border-radius: 4px;
  padding: 0.5rem;
}

.status-pane h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #cccccc;
}

.indicator-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.indicator-row-connected {
  display: flex;
}

.indicator-row-tracks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.5rem;
  overflow: auto;
}

.indicator-box {
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #444;
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
  color: #111;
  background-color: #f5f5f5;
  text-transform: none;
}

.indicator-box.off {
  background-color: transparent;
  color: #d4d4d4;
  border-color: #666;
}

.status-placeholder {
  font-size: 0.875rem;
  color: #aaaaaa;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dialog h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: #333;
}

.dialog-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.dialog-title-row h2 {
  margin: 0;
}

.warning-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #ffc107;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  line-height: 1;
}

.dialog p {
  margin: 0.5rem 0;
  color: #666;
  line-height: 1.5;
}

.dialog-button {
  margin-top: 1.5rem;
  padding: 0.5rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.dialog-button:hover {
  background-color: #0056b3;
}

.dialog-button:active {
  background-color: #004085;
}

.dialog-button.secondary {
  background-color: #ffffff;
  color: #333;
  border: 1px solid #ccc;
}

.dialog-button.secondary:hover {
  background-color: #f0f0f0;
}

.track-control-dialog {
  max-width: 500px;
}

.track-control-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.track-control-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.track-control-label {
  font-weight: 600;
  color: #333;
  min-width: 90px;
}

.speed-buttons-field {
  flex-direction: column;
  align-items: stretch;
}

.speed-buttons-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.speed-button {
  padding: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
}

.speed-button:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.speed-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.speed-button.selected {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.health-dialog {
  max-width: 600px;
}

.health-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.health-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.95rem;
}

.health-key {
  font-weight: 600;
  color: #333;
}

.health-value {
  color: #555;
}

.status-dialog {
  max-width: 600px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.status-row {
  font-size: 0.95rem;
  color: #444;
}

.status-empty {
  margin-top: 0.5rem;
  color: #666;
}

.about-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.about-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.95rem;
}

.about-key {
  font-weight: 600;
  color: #333;
}

.about-value {
  color: #555;
}

</style>

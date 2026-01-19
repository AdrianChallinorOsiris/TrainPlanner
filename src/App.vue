<template>
  <div class="app-shell">
    <div class="button-bar">
      <button class="bar-button" @click="handleReset">Reset</button>
      <button class="bar-button" @click="handleAllStop">All Stop</button>
      <button class="bar-button" @click="handleLedTest">Led Test</button>
      <button class="bar-button" @click="handleHealth">Health</button>
    </div>

    <div v-if="isCompact" class="compact-container">
      <div class="svg-pane">
        <div class="svg-label">Layout</div>
        <svg viewBox="0 0 2000 2400" width="100%" height="100%">
          <TrackLayout
            :sections-state="sections"
            :sensors-state="sensors"
            :point-groups-state="pointGroups"
          />
        </svg>
      </div>

      <div class="tab-bar">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'sections' }"
          @click="activeTab = 'sections'"
        >
          Sections
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'points' }"
          @click="activeTab = 'points'"
        >
          Point Groups
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'sensors' }"
          @click="activeTab = 'sensors'"
        >
          Sensors
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'commands' }"
          @click="activeTab = 'commands'"
        >
          Commands
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'log' }"
          @click="activeTab = 'log'"
        >
          Log
        </button>
      </div>

      <div class="tab-content">
        <SectionsPane v-show="activeTab === 'sections'" :sections="sections" />
        <PointsPane v-show="activeTab === 'points'" :point-groups="pointGroups" />
        <SensorsPane v-show="activeTab === 'sensors'" :sensors="sensors" />
        <CommandsPane v-show="activeTab === 'commands'" />
        <LogWindow v-show="activeTab === 'log'" ref="logWindowRef" />
      </div>
    </div>

    <div v-else class="app-container">
    <div class="left-container">
      <div class="svg-pane">
        <div class="svg-label">Layout</div>
        <svg viewBox="0 0 2000 2400" width="100%" height="100%">
          <TrackLayout
            :sections-state="sections"
            :sensors-state="sensors"
            :point-groups-state="pointGroups"
          />
        </svg>
      </div>
      <LogWindow ref="logWindowRef" />
    </div>
    <div class="right-container">
      <div class="panes-container">
        <SectionsPane :sections="sections" />
        <PointsPane :point-groups="pointGroups" />
        <SensorsPane :sensors="sensors" />
      </div>
      <CommandsPane />
    </div>
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
    <div class="dialog">
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
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide, watch } from 'vue'
import SectionsPane from './components/SectionsPane.vue'
import PointsPane from './components/PointsPane.vue'
import SensorsPane from './components/SensorsPane.vue'
import CommandsPane from './components/CommandsPane.vue'
import LogWindow from './components/LogWindow.vue'
import TrackLayout from './components/TrackLayout.vue'
import { api } from './services/api'
import { getTrackSection } from './utils/trackData'

const logWindowRef = ref(null)
const showSimulationDialog = ref(false)
const showConnectedDialog = ref(false)
const liveMode = ref(false)
const isCompact = ref(false)
const activeTab = ref('sections')
const showHealthDialog = ref(false)
const healthDetails = ref([])
const isApplyingStatus = ref(false)
const statusIntervalId = ref(null)

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
      speed: 100
    }
  })
)
const previousSectionDirections = ref(new Map())
const previousSectionSpeeds = ref(new Map())
const previousHeldSections = ref(new Map())

// Point groups state - shared between PointsPane and TrackLayout
const pointGroups = ref(
  Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    type: 'thru'
  }))
)
const previousPointGroups = ref(new Map())

// Sensors state - shared between SensorsPane and TrackLayout
const sensors = ref(
  Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    set: false
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

const closeHealthDialog = () => {
  showHealthDialog.value = false
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
      if (entry.speed !== undefined && entry.speed !== null) {
        section.speed = entry.speed
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
  } catch (error) {
    // Ignore transient errors to avoid log spam
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
          try {
            if (logWindowRef.value) {
              logWindowRef.value.addMessage(
                `Track ${section.id} set to OFF`
              )
            }
            await api.setTrackSpeed(section.id, 100, 'OFF')
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

      const direction =
        section.direction === 'forward'
          ? 'FWD'
          : 'BCK'
      const speed = Math.min(100, Math.max(25, section.speed || 100))
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
  flex: 1;
  min-height: 0;
  width: 100%;
}

.compact-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.compact-container .svg-pane {
  width: 100%;
  align-self: stretch;
  border-bottom: 1px solid #ddd;
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
}

.left-container {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ddd;
}

.svg-pane {
  flex: 1;
  min-height: 0;
  border-bottom: 1px solid #ddd;
  background-color: #f9f9f9;
  position: relative;
  width: calc(100% - 100px);
  align-self: flex-start;
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

.left-container > :last-child {
  flex: 0 0 200px;
  min-height: 200px;
}

.svg-pane svg {
  display: block;
  background-color: white;
  width: 100%;
  height: 100%;
}

.right-container {
  flex: 0 0 900px;
  width: 900px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panes-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
}

.right-container > :last-child {
  flex: 0 0 200px;
  min-height: 200px;
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
</style>

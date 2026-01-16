<template>
  <div class="app-shell">
    <div class="button-bar">
      <button class="bar-button" @click="handleReset">Reset</button>
      <button class="bar-button" @click="handleAllStop">All Stop</button>
      <button class="bar-button" @click="handleLedTest">Led Test</button>
    </div>
    <div class="app-container">
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
</template>

<script setup>
import { ref, onMounted, provide, watch } from 'vue'
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

// Sections state - shared between SectionsPane and TrackLayout
const sections = ref(
  Array.from({ length: 12 }, (_, i) => {
    const id = i + 1
    const sectionDef = getTrackSection(id)
    return {
      id,
      name: sectionDef?.name || '',
      direction: 'off',
      held: false
    }
  })
)
const previousSections = ref(new Map())

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
  Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    set: false
  }))
)

const closeSimulationDialog = () => {
  showSimulationDialog.value = false
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

watch(
  pointGroups,
  async (newGroups) => {
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
    if (!liveMode.value) {
      return
    }
    const prevMap = previousSections.value
    const nextMap = new Map()
    for (const section of newSections) {
      nextMap.set(section.id, section.direction)
      const prevDirection = prevMap.get(section.id)
      if (prevDirection && prevDirection === section.direction) {
        continue
      }
      if (!prevDirection) {
        continue
      }
      const direction =
        section.direction === 'forward'
          ? 'FWD'
          : section.direction === 'backwards'
            ? 'BCK'
            : 'OFF'
      const speed = 100
      try {
        if (logWindowRef.value) {
          logWindowRef.value.addMessage(
            `Track ${section.id} set to ${direction} speed ${speed}`
          )
        }
        await api.setTrackSpeed(section.id, speed, direction)
      } catch (error) {
        if (logWindowRef.value) {
          logWindowRef.value.addMessage(
            `Track ${section.id} update failed: ${error.message}`
          )
        }
      }
    }
    previousSections.value = nextMap
  },
  { deep: true }
)

watch(liveMode, (isLive) => {
  if (!isLive) {
    return
  }
  const nextMap = new Map()
  for (const section of sections.value) {
    nextMap.set(section.id, section.direction)
  }
  previousSections.value = nextMap
})

provide('liveMode', liveMode)

onMounted(() => {
  checkHealth()
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
</style>

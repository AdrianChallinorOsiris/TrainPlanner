<template>
  <div class="app-container">
    <div class="left-container">
      <div class="svg-pane">
        <div class="svg-label">Layout</div>
        <svg viewBox="0 0 2000 2400" width="100%" height="100%">
          <TrackLayout :sections-state="sections" />
        </svg>
      </div>
      <LogWindow ref="logWindowRef" />
    </div>
    <div class="right-container">
      <div class="panes-container">
        <SectionsPane :sections="sections" />
        <PointsPane />
        <SensorsPane />
      </div>
      <CommandsPane />
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
import { ref, onMounted } from 'vue'
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

const closeSimulationDialog = () => {
  showSimulationDialog.value = false
}


const checkHealth = async () => {
  if (logWindowRef.value) {
    logWindowRef.value.addMessage('Checking connection to Raspberry Pi...')
  }
  
  const result = await api.healthCheck()
  
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

onMounted(() => {
  checkHealth()
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
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

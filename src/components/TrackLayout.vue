<template>
  <g class="track-layout">
    <!-- Render track sections -->
    <g
      v-for="section in trackSections"
      :key="section.id"
      :class="['track-section', `section-${section.id}`]"
    >
      <!-- Render SVG paths -->
      <path
        v-if="section.path"
        :d="section.path"
        :stroke="section.color"
        :stroke-width="getStrokeWidth(section.id)"
        :stroke-dasharray="getStrokeDashArray(section.id)"
        fill="none"
      />
      
      <!-- Render points -->
      <g
        v-for="pointDef in section.points"
        :key="`point-${pointDef.id}`"
        class="point-group"
      >
        <path
          :d="getPointEntryPath(pointDef)"
          :stroke="section.color"
          :stroke-width="getStrokeWidth(section.id)"
          :stroke-dasharray="getStrokeDashArray(section.id)"
          fill="none"
        />
        <path
          :d="getPointThruPath(pointDef)"
          :stroke="section.color"
          :stroke-width="getStrokeWidth(section.id)"
          :stroke-dasharray="getStrokeDashArray(section.id)"
          fill="none"
        />
        <path
          :d="getPointBranchPath(pointDef)"
          :stroke="section.color"
          :stroke-width="getStrokeWidth(section.id)"
          :stroke-dasharray="getStrokeDashArray(section.id)"
          fill="none"
        />
      </g>

      <!-- Render markers -->
      <g
        v-for="(marker, markerIndex) in section.markers"
        :key="`marker-${section.id}-${markerIndex}`"
        :transform="getMarkerTransform(marker)"
      >
        <rect
          :x="-MARKER_SIZE / 2"
          :y="-MARKER_SIZE / 2"
          :width="MARKER_SIZE"
          :height="MARKER_SIZE"
          fill="#ffffff"
          :stroke="getMarkerColor(section.id)"
          :stroke-width="4"
        />
        <text
          v-if="getDirectionLabel(section.id)"
          :x="getDirectionLabelX(section.id)"
          y="8"
          text-anchor="middle"
          font-size="28"
          font-weight="700"
          :fill="getMarkerColor(section.id)"
        >
          {{ getDirectionLabel(section.id) }}
        </text>
        <text
          x="0"
          y="8"
          text-anchor="middle"
          font-size="24"
          font-weight="600"
          :fill="getMarkerColor(section.id)"
        >
          {{ section.id }}
        </text>
      </g>

      <!-- Render sensors -->
      <g
        v-for="(sensor, sensorIndex) in section.sensors"
        :key="`sensor-${section.id}-${sensorIndex}`"
        :transform="getSensorTransform(sensor)"
      >
        <circle
          cx="0"
          cy="0"
          :r="SENSOR_RADIUS"
          :fill="getSensorFill(sensor.id)"
          :stroke="SENSOR_STROKE_COLOR"
          :stroke-width="SENSOR_STROKE_WIDTH"
        />
        <text
          x="0"
          y="8"
          text-anchor="middle"
          font-size="22"
          font-weight="600"
          :fill="getSensorTextColor(sensor.id)"
        >
          {{ sensor.id }}
        </text>
      </g>
    </g>
  </g>
</template>

<script setup>
import { computed } from 'vue'
import { calculatePointGeometry, pointEntryPath, pointThruPath, pointBranchPath } from '../utils/trackUtils'
import { getAllTrackSections } from '../utils/trackData'

// Props for section state (will be passed from parent)
const props = defineProps({
  sectionsState: {
    type: Array,
    default: () => []
  },
  sensorsState: {
    type: Array,
    default: () => []
  }
})

const MARKER_SIZE = 75
const LABEL_OFFSET = 12
const SENSOR_RADIUS = 22
const SENSOR_STROKE_WIDTH = 3
const SENSOR_STROKE_COLOR = '#ff0000'

// Get track section definitions
const trackSections = computed(() => getAllTrackSections())

// Get stroke width based on section state
function getStrokeWidth(sectionId) {
  const section = props.sectionsState?.find(s => s.id === sectionId)
  if (!section) return 8 // Default to unpowered (Off)
  
  if (section.direction === 'off') {
    return 8 // Unpowered track
  } else {
    return 16 // Powered track (Forward/Reverse)
  }
}

// Get stroke dash array based on held state
function getStrokeDashArray(sectionId) {
  const section = props.sectionsState?.find(s => s.id === sectionId)
  if (!section) return 'none'
  
  return section.held ? '5,5' : 'none'
}

function getMarkerColor(sectionId) {
  const section = props.sectionsState?.find(s => s.id === sectionId)
  if (!section) return '#000000'
  return section.held ? '#ff0000' : '#000000'
}

function getMarkerTransform(marker) {
  const x = marker.x || 0
  const y = marker.y || 0
  const rotation = marker.rotation || 0
  return `translate(${x} ${y}) rotate(${rotation})`
}

function getDirectionLabel(sectionId) {
  const section = props.sectionsState?.find(s => s.id === sectionId)
  if (!section || section.direction === 'off') return ''

  if (section.direction === 'forward') {
    return 'F'
  }

  if (section.direction === 'backwards') {
    return 'B'
  }

  return ''
}

function getDirectionLabelX(sectionId) {
  const section = props.sectionsState?.find(s => s.id === sectionId)
  if (!section || section.direction === 'off') return 0

  const halfSize = MARKER_SIZE / 2

  if (section.direction === 'forward') {
    return halfSize - LABEL_OFFSET
  }

  if (section.direction === 'backwards') {
    return -halfSize + LABEL_OFFSET
  }

  return 0
}

function getSensorTransform(sensor) {
  const x = sensor.x || 0
  const y = sensor.y || 0
  return `translate(${x} ${y})`
}

function getSensorState(sensorId) {
  return props.sensorsState?.find(s => s.id === sensorId)
}

function getSensorFill(sensorId) {
  const sensor = getSensorState(sensorId)
  return sensor?.set ? '#ff0000' : '#ffffff'
}

function getSensorTextColor(sensorId) {
  const sensor = getSensorState(sensorId)
  return sensor?.set ? '#ffffff' : '#000000'
}

// Get point paths
function getPointEntryPath(pointDef) {
  const geo = calculatePointGeometry({
    x: pointDef.x,
    y: pointDef.y,
    handedness: pointDef.handedness,
    rotation: pointDef.rotation
  })
  return pointEntryPath(geo)
}

function getPointThruPath(pointDef) {
  const geo = calculatePointGeometry({
    x: pointDef.x,
    y: pointDef.y,
    handedness: pointDef.handedness,
    rotation: pointDef.rotation
  })
  return pointThruPath(geo)
}

function getPointBranchPath(pointDef) {
  const geo = calculatePointGeometry({
    x: pointDef.x,
    y: pointDef.y,
    handedness: pointDef.handedness,
    rotation: pointDef.rotation
  })
  return pointBranchPath(geo)
}
</script>

<style scoped>
.track-section {
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>

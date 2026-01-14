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
  }
})

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

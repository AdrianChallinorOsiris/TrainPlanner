// Track section data structure and management

/**
 * Track section visual definition
 */
export class TrackSection {
  constructor(id, config = {}) {
    this.id = id
    this.color = config.color || '#333333' // Default color
    this.path = config.path || null // SVG path definition (path d attribute)
    this.points = config.points || [] // Array of point definitions
    this.startX = config.startX || 0
    this.startY = config.startY || 0
  }
}

/**
 * Point definition within a track section
 */
export class PointDefinition {
  constructor(config = {}) {
    this.id = config.id // Point ID (1-12)
    this.handedness = config.handedness || 'left' // 'left' or 'right'
    this.rotation = config.rotation || 0 // Rotation in degrees (multiple of 45)
    this.x = config.x || 0 // X position (open end of entry)
    this.y = config.y || 0 // Y position (open end of entry)
  }
}

// Store for track sections
const trackSections = new Map()

/**
 * Get track section by ID
 */
export function getTrackSection(id) {
  return trackSections.get(id)
}

/**
 * Set track section
 */
export function setTrackSection(id, section) {
  trackSections.set(id, section)
}

/**
 * Get all track sections
 */
export function getAllTrackSections() {
  return Array.from(trackSections.values())
}

// Initialize section 1
// Note: Path uses 'l' for relative lines 
setTrackSection(1, new TrackSection(1, {
  color: '#00008B', // Dark blue
  path: 'M 1400 200 m 0 -10 l 0 20 m 0 -10 l 200 0 a 500 500 0 0 1 0 2000 l -1600 0 a 500 500 0 0 1 0 -2000 l 400 0 m 0 -10 l 0 20 m 0 -10'

}))

// Initialize section 2
// Yellow section with two points and connecting paths
// Point 1-A: left-hand, 180° rotation, thru end at (800, 200)
// Point 3-A: right-hand, 0° rotation, entry at (620, 200)
setTrackSection(2, new TrackSection(2, {
  color: '#000000', // Yellow
  points: [
    new PointDefinition({
      id: 1, // Point 1-A (controlled by Point 1)
      handedness: 'left',
      rotation: 180,
      x: 600, // Entry open end
      y: 200
    }),
    new PointDefinition({
      id: 3, // Point 3-A (controlled by Point 3)
      handedness: 'right',
      rotation: 0,
      x: 800, // Entry open end
      y: 200
    }),
  ],
  path: 'M 600 200 l 200 0 M 1000 200 l 400 0 m 0 -10 l 0 20 m 0 -10' 
}))

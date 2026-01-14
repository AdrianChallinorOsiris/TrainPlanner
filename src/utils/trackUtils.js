// Track visualization utilities
// Scale: 1cm = 10 SVG units

export const SCALE = 10 // 1cm = 10 SVG units
export const POINT_ENTRY_LENGTH = 100
export const POINT_THRU_LENGTH = 100
export const POINT_BRANCH_LENGTH = 141.42

/**
 * Calculate point geometry
 * @param {Object} config
 * @param {number} config.x - X coordinate of entry start (open end)
 * @param {number} config.y - Y coordinate of entry start (open end)
 * @param {string} config.handedness - 'left' or 'right'
 * @param {number} config.rotation - Rotation in degrees (multiple of 45)
 * @returns {Object} Point geometry with entry, thru, and branch paths
 */
export function calculatePointGeometry({ x, y, handedness, rotation = 0 }) {
  // Start with entry line going from left to right (0°)
  // Entry: horizontal line 10 units, from (x, y) to (x + 10, y)
  // Thru: continuation 10 units to (x + 20, y)
  // Branch: 45° line starting at junction (x + 10, y)
  
  // Rotation point is at (x, y) - the open end of Entry
  
  const entryEndX = x + POINT_ENTRY_LENGTH
  const entryEndY = y
  const junctionX = entryEndX
  const junctionY = entryEndY
  
  const thruEndX = junctionX + POINT_THRU_LENGTH
  const thruEndY = junctionY
  
  // Branch line: 45° angle
  // For left-hand: branch goes up (negative Y in SVG coordinates)
  // For right-hand: branch goes down (positive Y in SVG coordinates)
  const branchDirection = handedness === 'left' ? -1 : 1
  
  // Calculate branch end (45° angle)
  const branchEndX = junctionX + POINT_BRANCH_LENGTH * Math.cos(Math.PI / 4)
  const branchEndY = junctionY + branchDirection * POINT_BRANCH_LENGTH * Math.sin(Math.PI / 4)
  
  // Apply rotation around (x, y)
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  
  // Rotate points around (x, y)
  function rotatePoint(px, py) {
    const dx = px - x
    const dy = py - y
    return {
      x: x + dx * cos - dy * sin,
      y: y + dx * sin + dy * cos
    }
  }
  
  const entryStart = { x, y }
  const entryEndRot = rotatePoint(entryEndX, entryEndY)
  const junctionRot = entryEndRot
  const thruEndRot = rotatePoint(thruEndX, thruEndY)
  const branchEndRot = rotatePoint(branchEndX, branchEndY)
  
  return {
    entry: {
      start: entryStart,
      end: entryEndRot
    },
    thru: {
      start: junctionRot,
      end: thruEndRot
    },
    branch: {
      start: junctionRot,
      end: branchEndRot
    },
    rotationPoint: entryStart,
    junction: junctionRot
  }
}

/**
 * Generate SVG path for a point's entry line
 */
export function pointEntryPath(pointGeo) {
  return `M ${pointGeo.entry.start.x} ${pointGeo.entry.start.y} L ${pointGeo.entry.end.x} ${pointGeo.entry.end.y}`
}

/**
 * Generate SVG path for a point's thru line
 */
export function pointThruPath(pointGeo) {
  return `M ${pointGeo.thru.start.x} ${pointGeo.thru.start.y} L ${pointGeo.thru.end.x} ${pointGeo.thru.end.y}`
}

/**
 * Generate SVG path for a point's branch line
 */
export function pointBranchPath(pointGeo) {
  return `M ${pointGeo.branch.start.x} ${pointGeo.branch.start.y} L ${pointGeo.branch.end.x} ${pointGeo.branch.end.y}`
}

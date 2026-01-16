// Track section data structure and management

/**
 * Track section visual definition
 */
export class TrackSection {
  constructor(id, config = {}) {
    this.id = id
    this.name = config.name || ''
    this.color = config.color || '#333333' // Default color
    this.path = config.path || null // SVG path definition (path d attribute)
    this.points = config.points || [] // Array of point definitions
    this.markers = config.markers || [] // Array of track markers
    this.sensors = config.sensors || [] // Array of sensor markers
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

/**
 * Track marker definition (square with direction triangle)
 */
export class TrackMarker {
  constructor(config = {}) {
    this.x = config.x || 0
    this.y = config.y || 0
    this.rotation = config.rotation || 0 // degrees
  }
}

/**
 * Sensor marker definition (circle with sensor number)
 */
export class SensorMarker {
  constructor(config = {}) {
    this.id = config.id // Sensor ID (1-16)
    this.x = config.x || 0
    this.y = config.y || 0
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
setTrackSection(1, new TrackSection(1, {
  color: '#00008B', // Dark blue
  name: 'Outer loop',
  path: 'M 1400 200 m 0 -10 l 0 20 m 0 -10 l 200 0 a 500 500 0 0 1 0 2000 l -1600 0 a 500 500 0 0 1 0 -2000 l 400 0 m 0 -10 l 0 20 m 0 -10'  ,
  markers: [
    new TrackMarker({ x: 200, y: 200, rotation: 0 }),
  ],
  sensors: [
    new SensorMarker({ id: 1, x: 900, y: 2200}),

  ]
}))

// Initialize section 2
setTrackSection(2, new TrackSection(2, {
    color: 'blue', // Dark blue
    name: 'Middle Loop',
    path: 'M 1400 400 m 0 -10 l 0 20 m 0 -10 l 200 0 a 500 500 0 0 1 0 1600  l -1600 0 a 500 500 0 0 1 0 -1600 ',
    points: [
      new PointDefinition({
        id: 1, 
        handedness: 'right',
        rotation: 0,
        x: 0, // Entry open end
        y: 400
      }),
      new PointDefinition({
        id: 3, 
        handedness: 'left',
        rotation: 0,
        x: 200, // Entry open end
        y: 400
      }),
    ], 
    markers: [
        new TrackMarker({ x: 200, y: 400, rotation: 0 }),
    ],
    sensors: [
        new SensorMarker({ id: 2, x: 900, y: 2000}),

    ]
  }))

// Initialize section 3
// Yellow section with two points and connecting paths
// Point 1-A: left-hand, 180° rotation, thru end at (800, 200)
// Point 3-A: right-hand, 0° rotation, entry at (620, 200)
setTrackSection(3, new TrackSection(3, {
  color: 'yellow', 
  name: 'Outer loop - Platform 1',
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
  path: 'M 600 200 l 200 0 M 1000 200 l 400 0 m 0 -10 l 0 20 m 0 -10' ,
  markers: [
    new TrackMarker({ x:800, y: 200, rotation: 0 }),
  ],
  sensors: [
    new SensorMarker({ id:3, x: 700, y: 200}),
]
}))

setTrackSection(4, new TrackSection(4, {
    color: 'lightblue', // Yellow
    name: 'Middle loop Platform 2',
    points: [
      new PointDefinition({
        id: 2, 
        handedness: 'left',
        rotation: 180,
        x: 800, // Entry open end
        y: 400
      }),
      new PointDefinition({
        id: 3, 
        handedness: 'right',
        rotation: 180,
        x: 1200, // Entry open end
        y: 400
      }),
      new PointDefinition({
        id: 4, 
        handedness: 'right',
        rotation: 0,
        x: 1200, // Entry open end
        y: 400
      }),      
    ],
    path: 'M 400 400 l 200 0 m 200 0 l 200 0 m 400 0' ,
    markers: [
        new TrackMarker({ x:800, y: 400, rotation: 0 }),
    ],
    sensors: [
        new SensorMarker({ id: 4, x: 500, y: 400}),
    ]
  }))

  setTrackSection(5, new TrackSection(5, {
    color: 'lightgreen', 
    name: 'Inner loop - part 1',
    points: [
      new PointDefinition({
        id: 4, 
        handedness: 'right',
        rotation: 180,
        x: 1600, // Entry open end
        y: 600
      }),
      new PointDefinition({
        id: 6, 
        handedness: 'right',
        rotation: 180,
        x: 1600, // Entry open end
        y: 1800
      })
    ],
    path: 'M 1600 600 a 500 500 0 0 1 0 1200 ',
    markers: [
      new TrackMarker({ x:1600, y: 600, rotation: 0 }),
    ],
    sensors: [
        new SensorMarker({ id: 5, x: 2200, y: 1100}),
    ]
  }))

  setTrackSection(6, new TrackSection(6, {
    color: 'green', 
    name: 'Inner loop - Station',
    path: 'M 600 600 l 800 0 ',
    markers: [
        new TrackMarker({ x:800, y: 600, rotation: 0 }),
      ],
    sensors: [
        new SensorMarker({ id: 12, x: 1000, y: 600}),
    ]
  }))

  setTrackSection(7, new TrackSection(7, {
    color: 'purple', 
    name: 'Inner loop - part 2',
    path: 'M 1400 1800 l -1200 0 ',
    markers: [
        new TrackMarker({ x:800, y: 1800, rotation: 0 }),
    ],
    sensors: [
        new SensorMarker({ id: 6, x: 1000, y: 1800}),
    ]
  }))

  setTrackSection(8, new TrackSection(8, {
    color: 'cyan', 
    name: 'Sidings selector',
    points: [
      new PointDefinition({
        id: 7, 
        handedness: 'left',
        rotation: 225,
        x: 1400, // Entry open end
        y: 1700
      }), 
      new PointDefinition({
        id: 8, 
        handedness: 'right',
        rotation: 180,
        x: 1200, // Entry open end
        y: 1631
      })
    ],
    markers: [
      new TrackMarker({ x:1350, y: 1650, rotation: 0 }),
    ],
    sensors: [
        new SensorMarker({ id: 7, x: 1200, y: 1631}),
    ]
  }))

  setTrackSection(9, new TrackSection(9, {
    color: 'cyan',
    name: 'Inner loop - part 3',
    path: 'M 0 1800 a 500 500 0 0 1 0 -1200 l 400 0 ',
    points: [
      new PointDefinition({
        id: 9, 
        handedness: 'left',
        rotation: 0,
        x: 0, // Entry open end
        y: 1800
      }), 
      new PointDefinition({
        id: 10, 
        handedness: 'left',
        rotation: 0,
        x: 400, // Entry open end
        y: 600
      })
    ],
    markers: [
        new TrackMarker({ x:0, y: 600, rotation: 0 }),
    ],
    sensors: [
        new SensorMarker({ id: 8, x: -600, y: 1100}),
    ]
  }))

  setTrackSection(10, new TrackSection(10, {
    color: 'red',
    name: 'Reversing line',
    path: 'M 200 500 l 200 200 l 853 853 ',
    markers: [
        new TrackMarker({ x:400, y: 700, rotation: 0 }),
    ],
    sensors: [
        new SensorMarker({ id: 9, x: 800, y: 1100}),
    ]
  }))

  setTrackSection(11, new TrackSection(11, {
    color: '#9575CD',
    name: 'Inner loop - passing point',
    path: 'M 200 1700 l 68 -68 l 750 0 ',
    markers: [
        new TrackMarker({ x:800, y: 1640, rotation: 0 }),
      ],
    sensors: [
        new SensorMarker({ id: 10, x: 900, y: 1628}),
    ]
  }))

  setTrackSection(12, new TrackSection(12, {
    color: 'orange',
    name: 'sidings',
    points: [
      new PointDefinition({
        id: 11, 
        handedness: 'left',
        rotation: 225,
        x: 1018, // Entry open end
        y: 1550
      }),
      new PointDefinition({
        id: 12, 
        handedness: 'right',
        rotation: 225,
        x: 876, // Entry open end
        y: 1410
      }),
      new PointDefinition({
        id: 13, 
        handedness: 'left',
        rotation: 225,
        x: 800, // Entry open end
        y: 1480
      })
    ],
    path: 'M 800 1480 l -100 -100 M 586 1403 l -400 -400 M 655 1335 l -400 -400 M 735 1268 l -400 -400 M 808 1200 l -400 -400 ',
    markers: [
        new TrackMarker({ x:800, y: 1480, rotation: 0 }),
    ],
    sensors: [
        new SensorMarker({ id: 11, x: 320, y: 1150}),
        new SensorMarker({ id: 12, x: 400, y: 1080}),
        new SensorMarker({ id: 13, x: 480, y: 1000}),
        new SensorMarker({ id: 14, x: 560, y: 950}),
    ]
  }))
# Planner

A Vue.js application for managing Adrian's Train Set. It handles track sections, points (switches), and sensors, with SVG visualization and Raspberry Pi connectivity.

## Features

- **Sections Management**: 12 sections with configurable name, direction (forward/reverse), powered state, and held state
- **Points Management**: 12 points/switches with branch/through configuration
- **Sensors Management**: 12 sensors with toggle buttons (visual red circles when set)
- **SVG Drawing Pane**: Visualization area for displaying system layout
- **Log Window**: Real-time logging of application events
- **Raspberry Pi Integration**: Connects to a Raspberry Pi on port 5000 for live mode operation
- **Simulation Mode**: Falls back to simulation mode when Pi is unavailable

## Project Structure

```
Planner/
├── src/
│   ├── components/
│   │   ├── SectionsPane.vue    # Sections management panel
│   │   ├── PointsPane.vue      # Points/switches management panel
│   │   ├── SensorsPane.vue     # Sensors management panel
│   │   └── LogWindow.vue       # Log display window
│   ├── services/
│   │   └── api.js              # Raspberry Pi API service
│   ├── App.vue                 # Main application component
│   ├── main.js                 # Application entry point
│   └── style.css               # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Setup

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Configuration

### Raspberry Pi Connection

The application connects to a Raspberry Pi at `pi:5000` with all API endpoints starting with `/API`.

- **Base URL**: `http://pi:5000`
- **Health Endpoint**: `/API/health`
- **Connection Timeout**: 3 seconds

On startup, the application attempts to connect to the Pi. If the connection fails, a dialog appears indicating the application is running in **Simulation Mode** instead of **Live Mode**.

## Usage

### Sections Panel

- **ID**: Section identifier (1-12)
- **Name**: Editable section name
- **Direction**: Forward or Reverse
- **Powered**: Checkbox to enable/disable power
- **Held**: Checkbox to set held state

### Points Panel

- **ID**: Point identifier (1-12)
- **Type**: Branch or Through

### Sensors Panel

- **ID**: Sensor identifier (1-12)
- **Toggle Button**: Click to set/clear sensor state
  - Red circle (illuminated) = Set
  - Gray circle = Cleared

### Log Window

The log window displays timestamped messages from the application, including:
- Connection status to Raspberry Pi
- System events
- Error messages

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next-generation frontend build tool
- **SVG** - Scalable vector graphics support

## Development

The application uses Vue 3 Composition API with `<script setup>` syntax for component development.

### Adding New Features

- Components are located in `src/components/`
- API services are in `src/services/`
- Main application logic is in `src/App.vue`

## License

Private project

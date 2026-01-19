<template>
  <div class="sensors-pane">
    <h2>Sensors</h2>
    <div class="sensors-list">
      <div
        v-for="sensor in sensors"
        :key="sensor.id"
        class="sensor-item"
        :class="{ 'sensor-disabled': sensor.disabled }"
      >
        <span class="sensor-id">{{ sensor.id }}</span>
        <button
          @click="toggleSensor(sensor.id)"
          class="sensor-button"
          :class="{ 'sensor-set': sensor.set }"
          :aria-pressed="sensor.set"
          :disabled="sensor.disabled"
        >
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  sensors: {
    type: Array,
    required: true
  }
})

const toggleSensor = (id) => {
  const sensor = props.sensors.find(s => s.id === id)
  if (sensor) {
    sensor.set = !sensor.set
  }
}
</script>

<style scoped>
.sensors-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sensors-pane h2 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  padding: 0 1rem;
  padding-top: 1rem;
}

.sensors-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem 1rem 1rem;
  column-count: 2;
  column-gap: 0.75rem;
}

.sensor-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  background-color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sensor-id {
  font-weight: 600;
  color: #666;
  min-width: 30px;
}

.sensor-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #999;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sensor-item.sensor-disabled {
  opacity: 0.6;
}

.sensor-button:disabled {
  cursor: not-allowed;
}

.sensor-button:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.sensor-button:active {
  transform: scale(0.95);
}

.sensor-button.sensor-set {
  background-color: #ff4444;
  border-color: #cc0000;
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
}

.sensor-button.sensor-set:hover {
  box-shadow: 0 0 15px rgba(255, 68, 68, 0.7);
}
</style>

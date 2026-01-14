<template>
  <div class="sections-pane">
    <h2>Sections</h2>
    <div class="sections-list">
      <div
        v-for="section in sections"
        :key="section.id"
        class="section-item"
      >
        <div class="section-header">
          <span class="section-id">{{ section.id }}</span>
          <select 
            v-model="section.direction"
            class="direction-select"
            :class="{
              'direction-forward': section.direction === 'forward',
              'direction-backwards': section.direction === 'backwards',
              'direction-off': section.direction === 'off'
            }"
          >
            <option value="off">Off</option>
            <option value="forward">Forward</option>
            <option value="backwards">Backwards</option>
          </select>
          <label class="held-checkbox">
            <input
              type="checkbox"
              v-model="section.held"
            />
            <span>Held</span>
          </label>
          <input
            v-model="section.name"
            type="text"
            class="section-name-input"
            placeholder="Section name"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  sections: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.sections-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sections-pane h2 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  padding: 0 1rem;
  padding-top: 1rem;
}

.sections-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem 1rem 1rem;
}

.section-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  background-color: white;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-id {
  font-weight: 600;
  color: #666;
  min-width: 30px;
}

.direction-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 100px;
}

.direction-select.direction-forward {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.direction-select.direction-backwards {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.direction-select.direction-off {
  background-color: #ffffff;
}

.held-checkbox {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
}

.held-checkbox input[type="checkbox"] {
  cursor: pointer;
}

.section-name-input {
  flex: 1;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 0.9rem;
}
</style>

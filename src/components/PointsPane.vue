<template>
  <div class="points-pane">
    <h2>Point Groups</h2>
    <div class="points-list">
      <div
        v-for="group in pointGroups"
        :key="group.id"
        class="point-item"
      >
        <div class="point-header">
          <span class="point-id">{{ group.id }}</span>
          <select v-model="group.type">
            <option value="branch">Branch</option>
            <option value="thru">Thru</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  pointGroups: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.points-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.points-pane h2 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  padding: 0 1rem;
  padding-top: 1rem;
}

.points-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem 1rem 1rem;
}

.point-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  background-color: white;
}

.point-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.point-id {
  font-weight: 600;
  color: #666;
  min-width: 30px;
}

.point-header select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 100px;
}
</style>

<template>
  <div class="commands-pane">
    <h3>Commands</h3>
    <div class="commands-content">
      <textarea
        v-model="commandText"
        class="command-input"
        placeholder="Enter command..."
        @keydown.ctrl.enter="handleSubmit"
        @keydown.meta.enter="handleSubmit"
      ></textarea>
      <button @click="handleSubmit" class="submit-button">Submit</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const commandText = ref('')

const handleSubmit = () => {
  if (commandText.value.trim()) {
    // Call action routine (to be implemented)
    processCommand(commandText.value)
    // Clear input
    commandText.value = ''
  }
}

const processCommand = (command) => {
  // Action routine - to be implemented
  console.log('Command received:', command)
}
</script>

<style scoped>
.commands-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  border-top: 1px solid #ddd;
}

.commands-pane h3 {
  padding: 0.5rem 1rem;
  margin: 0;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.commands-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  gap: 0.5rem;
  position: relative;
  min-height: 0;
}

.command-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  resize: none;
  min-height: 0;
}

.command-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.submit-button {
  align-self: flex-end;
  padding: 0.5rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  margin-right: 0.5rem;
}

.submit-button:hover {
  background-color: #0056b3;
}

.submit-button:active {
  background-color: #004085;
}
</style>

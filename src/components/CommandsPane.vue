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
      <div class="commands-actions">
        <button @click="handleSubmit" class="submit-button">Compile</button>
        <button
          @click="handleExecute"
          class="submit-button"
          :disabled="!compileSucceeded"
        >
          Execute
        </button>
        <button @click="handleLoad" class="submit-button secondary">Load</button>
        <button @click="handleSave" class="submit-button secondary">Save</button>
      </div>
    </div>
  </div>

  <input
    ref="fileInputRef"
    type="file"
    accept=".txt,.dsl,.train,text/plain"
    class="file-input"
    @change="handleFileSelected"
  />
</template>

<script setup>
import { ref, watch } from 'vue'

const commandText = ref('')
const fileInputRef = ref(null)
const compileSucceeded = ref(false)

const handleSubmit = () => {
  if (commandText.value.trim()) {
    // Call action routine (to be implemented)
    processCommand(commandText.value)
    compileSucceeded.value = true
    // Clear input
    commandText.value = ''
  }
}

const processCommand = (command) => {
  // Action routine - to be implemented
  console.log('Command received:', command)
}

const handleExecute = () => {
  if (!compileSucceeded.value) {
    return
  }
  // Execute routine - to be implemented
  console.log('Execute pressed')
}

const handleLoad = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
    fileInputRef.value.click()
  }
}

const handleFileSelected = (event) => {
  const file = event.target.files?.[0]
  if (!file) {
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    commandText.value = String(reader.result || '')
    compileSucceeded.value = false
  }
  reader.readAsText(file)
}

const handleSave = () => {
  const blob = new Blob([commandText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'commands.txt'
  link.click()
  URL.revokeObjectURL(url)
}

watch(commandText, () => {
  compileSucceeded.value = false
})
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

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button.secondary {
  background-color: #ffffff;
  color: #333;
  border: 1px solid #ccc;
}

.submit-button.secondary:hover {
  background-color: #f0f0f0;
}

.commands-actions {
  align-self: flex-end;
  display: flex;
  gap: 0.5rem;
  margin-right: 0.5rem;
}

.file-input {
  display: none;
}
</style>

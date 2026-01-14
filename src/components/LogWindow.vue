<template>
  <div class="log-window">
    <h3>Log</h3>
    <div class="log-content" ref="logContentRef">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="log-message"
      >
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const messages = ref([])
const logContentRef = ref(null)

const addMessage = (message) => {
  const timestamp = new Date().toLocaleTimeString()
  messages.value.push(`[${timestamp}] ${message}`)
  // Auto-scroll to bottom
  nextTick(() => {
    if (logContentRef.value) {
      logContentRef.value.scrollTop = logContentRef.value.scrollHeight
    }
  })
}

// Expose addMessage method for parent component
defineExpose({
  addMessage
})

watch(messages, () => {
  nextTick(() => {
    if (logContentRef.value) {
      logContentRef.value.scrollTop = logContentRef.value.scrollHeight
    }
  })
}, { deep: true })
</script>

<style scoped>
.log-window {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Courier New', monospace;
}

.log-window h3 {
  padding: 0.5rem 1rem;
  margin: 0;
  background-color: #252526;
  border-bottom: 1px solid #3e3e42;
  font-size: 1rem;
  font-weight: 600;
  color: #cccccc;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.log-message {
  margin-bottom: 0.25rem;
  word-wrap: break-word;
}
</style>

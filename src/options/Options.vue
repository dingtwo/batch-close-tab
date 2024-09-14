<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { WHITE_LIST } from '../const/key'

const list = ref<string[]>([])
const rule = ref('')
const clear = async () => {
  chrome.storage.sync.clear()
}
const minus = (index: number) => {
  list.value.splice(index, 1)
}
const add = () => list.value.push(rule.value)
onMounted(() => {
  chrome.storage.sync.get([WHITE_LIST], (result) => {
    console.log('结果', result, Array.from(result[WHITE_LIST]))
    console.log('序列化', JSON.stringify(result[WHITE_LIST]))
    list.value = Array.from(result[WHITE_LIST])
  })
})
watch(
  list,
  (newList) => {
    chrome.storage.sync
      .set({ [WHITE_LIST]: Array.from(list.value) })
      .catch(console.error)
      .then(console.log)
    console.log(typeof newList)
    // TODO: why
  },
  { deep: true },
)
</script>

<template>
  <main>
    <h3>清理大师配置</h3>

    <div class="white-list">
      <ul>
        <li v-for="(rule, index) in list" :key="rule">
          <div class="calc">
            <button @click="minus(index)">-</button>
            <label>{{ rule }}</label>
          </div>
        </li>
        <li><input type="text" v-model="rule" /><button @click="add">+</button></li>
      </ul>
    </div>
    <div class="actions">
      <button @click="clear">clean rules</button>
    </div>
  </main>
</template>

<style>
:root {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color-scheme: light dark;
  background-color: #f5f5f5;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  :root {
    background-color: #242424;
    color: #e0e0e0;
  }
}

body {
  min-width: 20rem;
  margin: 0;
  padding: 0;
}

main {
  text-align: center;
  padding: 2em;
  margin: 0 auto;
  max-width: 800px;
}

h3 {
  color: #42b983;
  text-transform: uppercase;
  font-size: 1.8rem;
  font-weight: 300;
  margin: 2rem 0;
}

.white-list ul {
  list-style-type: none;
  padding: 0;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.white-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.calc {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

button {
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #42b983;
  color: white;
  cursor: pointer;
  outline: none;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #3aa876;
}

.calc > button {
  background-color: #f44336;
}

.calc > button:hover {
  background-color: #d32f2f;
}

.calc > label {
  flex-grow: 1;
  text-align: left;
  margin: 0 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.white-list li:last-child {
  display: flex;
  justify-content: space-between;
}

.white-list li:last-child input[type="text"] {
  flex-grow: 1;
  margin-right: 0.5rem;
}

.white-list li:last-child button {
  flex-shrink: 0;
}

input[type="text"] {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 0.5rem;
}

.actions button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.actions button:hover {
  background-color: #d32f2f;
}

@media (prefers-color-scheme: dark) {
  .calc {
    background-color: #333;
  }

  input[type="text"] {
    background-color: #444;
    color: #e0e0e0;
    border-color: #555;
  }
}
</style>

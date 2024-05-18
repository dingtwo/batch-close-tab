<script setup lang="ts">
import { ref, watch, onMounted, reactive } from 'vue'
import { CLOSE, CONFIRM, WHITE_LIST } from '../const/key'

const list = ref<string[]>([])
const rule = ref('')

const minus = (index: number) => {
  list.value.splice(index, 1)
}
const clear = async () => {
  chrome.storage.sync.clear()
}
const add = () => list.value.push(rule.value)
const close = () => chrome.runtime.sendMessage({ type: CLOSE })

onMounted(() => {
  chrome.storage.sync.get([WHITE_LIST], (result) => {
    console.log('结果', result, Array.from(result[WHITE_LIST]))
    console.log('序列化', JSON.stringify(result[WHITE_LIST]))
    list.value = Array.from(result[WHITE_LIST])
  })
})
chrome.runtime.onMessage.addListener((message, sender, response) => {
  console.log('收到消息', message)
  switch (message.type) {
    case CONFIRM:
      // TODO: 可以加个确认列表
      response(confirm(`即将删除${message.tabs.length}个tab`))
      break

    default:
      alert(`unknow message type:${message.type}`)
      break
  }
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
    <h3>tab clean</h3>

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

      <button @click="clear">clean rules</button>
      <button @click="close">close tabs</button>
    </div>
  </main>
</template>

<style>
:root {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;

  color-scheme: light dark;
  background-color: #242424;
}

@media (prefers-color-scheme: light) {
  :root {
    background-color: #fafafa;
  }

  a:hover {
    color: #42b983;
  }
}

body {
  min-width: 20rem;
  color-scheme: light dark;
}

main {
  text-align: center;
  padding: 1em;
  margin: 0 auto;
}

h3 {
  color: #42b983;
  text-transform: uppercase;
  font-size: 1.5rem;
  font-weight: 200;
  line-height: 1.2rem;
  margin: 2rem auto;
}

.calc {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem;

  > button {
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border: 1px solid #42b983;
    border-radius: 0.25rem;
    background-color: transparent;
    color: #42b983;
    cursor: pointer;
    outline: none;

    width: 3rem;
    margin: 0 a;
  }

  > label {
    font-size: 1.5rem;
    margin: 0 1rem;
  }
}

a {
  font-size: 0.5rem;
  margin: 0.5rem;
  color: #cccccc;
  text-decoration: none;
}
</style>

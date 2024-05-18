<script setup lang="ts">
import { ref, watch, onMounted, reactive } from 'vue'
import {
  MdExpandcircledown,
  MdCircle,
  MdExpandless,
  MdCleaningservicesRound,
  CoMoodVeryGood,
} from 'oh-vue-icons/icons'

import { CLOSE, CONFIRM, DONE, QUERY_TABS, WHITE_LIST } from '../const/key'

const list = ref<string[]>([])
const rule = ref('')
const isExpand = ref(false)
const tabs = ref([])
const done = ref(false)

const minus = (index: number) => {
  list.value.splice(index, 1)
}
const clear = async () => {
  chrome.storage.sync.clear()
}
const add = () => list.value.push(rule.value)
const close = () => {
  done.value = false
  chrome.runtime.sendMessage({ type: QUERY_TABS })
}
const toogleExpand = () => {
  isExpand.value = !isExpand.value
}
const clean = () => {
  chrome.runtime.sendMessage({ type: CLOSE, tabs: tabs.value })
}
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
      tabs.value = message.tabs
      // response(confirm(`即将删除${message.tabs.length}个tab`))
      break
    case QUERY_TABS:
      tabs.value = message.tabs
      console.log(tabs.value)
      break
    case DONE:
      done.value = true

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
    <header>
      <h3 @click="close">close tabs</h3>
      <v-icon
        @click="toogleExpand"
        :name="isExpand ? 'md-expandless' : 'md-expandcircledown'"
        animation="pulse"
        scale="1.5"
        fill="#15327B"
      />
    </header>

    <div class="tabs" v-show="tabs.length > 0">
      <v-icon v-if="done" name="co-mood-very-good"></v-icon>
      <div v-else>
        <button @click="clean"><v-icon name="md-cleaningservices-round"></v-icon></button>
        <ul>
          <li v-for="tab in tabs" :key="tab.id || tab.title">
            <p>{{ tab.title }}</p>
            <p>{{ tab.url }}</p>
          </li>
        </ul>
      </div>
    </div>

    <div class="white-list" v-show="isExpand">
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
    background-color: #f9fefe;
  }

  a:hover {
    color: #1a3080;
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
header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
  li {
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    padding: 10px;
  }
}

h3 {
  color: #1a3080;
  text-transform: uppercase;
  font-size: 1.5rem;
  font-weight: 200;
  line-height: 1.2rem;
  margin: 2rem auto;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
}

.calc {
  display: flex;
  justify-content: center;
  align-items: center;
  /* margin: 2rem; */

  > button {
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border: 1px solid #1a3080;
    border-radius: 0.25rem;
    background-color: transparent;
    color: #1a3080;
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

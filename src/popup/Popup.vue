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

const isExpand = ref(false)
const tabs = ref<chrome.tabs.Tab[]>([])
const done = ref(false)

const queryTabs = () => {
  done.value = false
  chrome.runtime.sendMessage({ type: QUERY_TABS })
}

const clean = () => {
  chrome.runtime.sendMessage({ type: CLOSE, tabs: tabs.value })
}
onMounted(() => {
  queryTabs()
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


</script>

<template>
  <main>
    <header>
      <h3>清理大师</h3>
    </header>

    <div class="tabs">
      <v-icon v-if="done" name="co-mood-very-good"></v-icon>
      <div v-else>
        <button @click="clean"><v-icon name="md-cleaningservices-round"></v-icon></button>
        <ul>
          <li v-for="tab in tabs" :key="tab.id || tab.title" class="tab-item">
            <img :src="tab.favIconUrl" alt="favicon" width="20" height="20" />
            <p class="tab-title">{{ tab.title }}</p>
          </li>
        </ul>
      </div>
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
}
ul > li {
  /* box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px; */
  padding: 10px;
  display: flex;
  flex-direction: row;
}

ul > li > img {
  margin-right: 10px;
}
.tab-title {
  line-height: 20px;
  margin: 0;
  padding: 0;
  white-space: nowrap; /* 溢出不换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}

h3 {
  color: #1a3080;
  text-transform: uppercase;
  font-size: 1.5rem;
  font-weight: 200;
  line-height: 1.2rem;
  margin: 2rem auto;
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 20px 25px -5px,
    rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
}



a {
  font-size: 0.5rem;
  margin: 0.5rem;
  color: #cccccc;
  text-decoration: none;
}
</style>

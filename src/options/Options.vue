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
}

main {
  text-align: center;
  padding: 1em;
  margin: 0 auto;
  max-width: 980px;
}
li {
  display: flex;
  flex-direction: row;
}
.calc {
  display: flex;
  justify-content: center;
  align-items: center;
  /* margin: 2rem; */
}
.calc > button {
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
.calc > label {
  font-size: 1.5rem;
  margin: 0 1rem;
}
h3 {
  color: #42b983;
  text-transform: uppercase;
  font-size: 1.5rem;
  font-weight: 200;
  line-height: 1.2rem;
  margin: 2rem auto;
}

a {
  font-size: 0.5rem;
  margin: 0.5rem;
  color: #cccccc;
  text-decoration: none;
}
</style>

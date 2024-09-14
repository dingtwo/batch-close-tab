<script setup lang="ts">
import { ref, watch, onMounted, reactive, computed } from 'vue'
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
const expandedGroups = reactive<Record<string, boolean>>({})
const whiteList = ref<string[]>([])
const defaultFavicon = ref('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ccc" width="100" height="100"/><text fill="%23333" x="50%" y="50%" font-family="Arial" font-size="50" text-anchor="middle" dy=".3em">?</text></svg>')
const removedDomains = reactive(new Set<string>())

// 辅助函数：获取一级域名或 IP
function getTopLevelDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;

    // 检查是否为 IP 地址
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      return hostname; // 如果是 IP 地址，直接返回
    }

    // 分割主机名
    const parts = hostname.split('.');

    // 处理特殊的二级顶级域名，如 .co.uk, .com.cn 等
    const specialTLDs = ['co.uk', 'com.cn', 'net.cn', 'org.cn', 'gov.cn'];
    for (const tld of specialTLDs) {
      if (hostname.endsWith(`.${tld}`)) {
        return parts.slice(-3).join('.');
      }
    }

    // 默认返回最后两部分
    return parts.slice(-2).join('.');
  } catch (error) {
    console.error('Invalid URL:', url);
    return 'unknown';
  }
}

const queryTabs = () => {
  done.value = false
  chrome.runtime.sendMessage({ type: QUERY_TABS })
}

const cleanWhiteListed = () => {
  const tabsToClose = tabs.value.filter(tab => {
    const domain = getTopLevelDomain(tab.url || '');
    return whiteList.value.includes(domain);
  });
  chrome.runtime.sendMessage({ type: CLOSE, tabs: tabsToClose }, () => {
    tabsToClose.forEach(tab => {
      const domain = getTopLevelDomain(tab.url || '');
      removedDomains.add(domain)
    });
    // 从 tabs 中移除已关闭的标签
    tabs.value = tabs.value.filter(tab => !whiteList.value.includes(getTopLevelDomain(tab.url || '')))
  });
}

onMounted(() => {
  queryTabs()
  // 获取白名单
  chrome.storage.sync.get([WHITE_LIST], (result) => {
    whiteList.value = result[WHITE_LIST] || []
  })
})

chrome.runtime.onMessage.addListener((message, sender, response) => {
  console.log('收到消息', message)
  switch (message.type) {
    case CONFIRM:
      tabs.value = message.tabs
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

const groupedTabs = computed(() => {
  const groups: Record<string, { tabs: chrome.tabs.Tab[], favicon: string }> = {};
  tabs.value.forEach(tab => {
    const domain = getTopLevelDomain(tab.url || '');
    if (!groups[domain]) {
      groups[domain] = {
        tabs: [],
        favicon: tab.favIconUrl || defaultFavicon.value
      };
    }
    groups[domain].tabs.push(tab);
  });
  return groups;
})

const toggleGroup = (domain: string) => {
  expandedGroups[domain] = !expandedGroups[domain]
}

const cleanDomain = (domain: string) => {
  const tabsToClose = tabs.value.filter(tab => getTopLevelDomain(tab.url || '') === domain);
  chrome.runtime.sendMessage({ type: CLOSE, tabs: tabsToClose }, () => {
    removedDomains.add(domain)
    // 从 tabs 中移除已关闭的标签
    tabs.value = tabs.value.filter(tab => getTopLevelDomain(tab.url || '') !== domain)
  });
}

const onFaviconError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img.src !== defaultFavicon.value) {
    img.src = defaultFavicon.value;
  }
};

const whiteListedTabsCount = computed(() => {
  return tabs.value.filter(tab => {
    const domain = getTopLevelDomain(tab.url || '');
    return whiteList.value.includes(domain);
  }).length;
});

</script>

<template>
  <main>
    <header>
      <h3>清理大师</h3>
    </header>

    <div class="tabs">
      <!-- <v-icon v-if="done" name="co-mood-very-good"></v-icon> -->
      <div>
        <button @click="cleanWhiteListed" class="clean-all-btn">
          <v-icon name="md-cleaningservices-round"></v-icon>
          清理白名单标签 ({{ whiteListedTabsCount }})
        </button>
        <transition-group name="list" tag="ul" class="domain-list">
          <li v-for="(group, domain) in groupedTabs" :key="domain" class="domain-group" v-show="!removedDomains.has(domain)">
            <div class="domain-header" @click="toggleGroup(domain)">
              <img :src="group.favicon || defaultFavicon" @error="onFaviconError" alt="favicon" class="domain-favicon" width="16" height="16" />
              <span class="domain-name">{{ domain }} ({{ group.tabs.length }})</span>
              <button @click.stop="cleanDomain(domain)" class="clean-domain-btn">
                <v-icon name="md-cleaningservices-round"></v-icon>
              </button>
              <v-icon :name="expandedGroups[domain] ? 'md-expandless' : 'md-expandcircledown'" class="expand-icon"></v-icon>
            </div>
            <transition name="expand">
              <ul v-if="expandedGroups[domain]" class="tab-list">
                <li v-for="tab in group.tabs" :key="tab.id || tab.title" class="tab-item">
                  <img :src="tab.favIconUrl || defaultFavicon" @error="onFaviconError" alt="favicon" class="tab-favicon" width="16" height="16" />
                  <p class="tab-title" :title="tab.title">{{ tab.title }}</p>
                </li>
              </ul>
            </transition>
          </li>
        </transition-group>
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
  text-align: left; /* 将整体内容左对齐 */
  padding: 1em;
  margin: 0 auto;
  width: 300px; /* 设置一个固宽度 */
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
  /* display: flex; */
  /* flex-direction: row; */
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

.domain-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.domain-group {
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.domain-header {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f0f0f0;
  cursor: pointer;
}

.domain-favicon,
.tab-favicon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  flex-shrink: 0;
  background-color: #f0f0f0; /* 为默认图标提供背景 */
}

.domain-name {
  font-weight: bold;
  flex-grow: 1;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 80px); /* 调整以适应清理按钮和展开图标 */
}

.clean-domain-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-right: 8px;
}

.expand-icon {
  font-size: 1.2em;
}

.tab-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 8px 8px 8px 24px; /* 左侧添加缩进 */
  border-top: 1px solid #eee;
  transition: background-color 0.2s ease;
}

.tab-item:hover {
  background-color: #f5f5f5;
}

.tab-item img {
  margin-right: 8px;
  flex-shrink: 0; /* 防止图标被压缩 */
}

.tab-title {
  margin: 0;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1; /* 允许标题占据剩余空间 */
  max-width: calc(100% - 24px); /* 减去图标和padding的宽度 */
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px; /* 根据实际内容调整 */
}

.expand-icon {
  transition: transform 0.3s ease;
}

.domain-header:hover .expand-icon {
  transform: scale(1.1);
}

.clean-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clean-all-btn:hover {
  background-color: #e0e0e0;
}

.clean-all-btn .v-icon {
  margin-right: 5px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.5s ease;
}
</style>

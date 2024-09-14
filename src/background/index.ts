import { CLOSE, CONFIRM, WHITE_LIST, QUERY_TABS, DONE } from '../const/key'

console.log('background is running')

function queryTabs() {
  chrome.storage.sync.get([WHITE_LIST], (result) => {
    const whitelist = result[WHITE_LIST] || []
    const regexList = whitelist.map((pattern: string) => new RegExp(pattern))

    chrome.tabs.query({}, (tabs) => {
      const matchedTabs = tabs.filter((tab) => {
        if (!tab.url) return false
        const url = new URL(tab.url)
        return regexList.some((regex: RegExp) => regex.test(url.hostname))
      })
      chrome.runtime.sendMessage({ type: QUERY_TABS, tabs: tabs })
    })
  })
}

chrome.runtime.onMessage.addListener((request) => {
  switch (request.type) {
    case QUERY_TABS:
      queryTabs()
      break
    case CLOSE:
      console.log('真的要删了', request.tabs)

      request.tabs.forEach((tab: chrome.tabs.Tab) => {
        if (tab.id) {
          chrome.tabs.remove(tab.id)
          chrome.runtime.sendMessage({ type: DONE })
        }
      })
      break
    default:
      break
  }
})

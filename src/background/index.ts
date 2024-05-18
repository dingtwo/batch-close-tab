import { CLOSE, CONFIRM, WHITE_LIST } from '../const/key'

console.log('background is running')

function clear() {
  chrome.storage.sync.get([WHITE_LIST], function (result) {
    const whitelist = result[WHITE_LIST] || []
    const regexList = whitelist.map((pattern: string) => new RegExp(pattern))

    chrome.tabs.query({}, function (tabs) {
      const matchedTabs = tabs.filter((tab) => {
        const url = new URL(tab.url!)
        return regexList.some((regex: RegExp) => regex.test(url.hostname))
      })
      chrome.runtime.sendMessage({ type: CONFIRM, tabs: matchedTabs }, (response) => {
        console.log('before remove tab', response)
        if (response) {
          matchedTabs.forEach((tab) => {
            chrome.tabs.remove(tab.id!)
          })
        }
      })
    })
  })
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === CLOSE) {
    clear()
  }
})

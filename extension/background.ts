/// <reference types="chrome" />

chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Harbor extension installed')
})

chrome.tabs.onCreated.addListener(() => {
  console.log('Tab created')
})

chrome.tabs.onRemoved.addListener(() => {
  console.log('Tab removed')
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab updated:', tabId)
  }
})

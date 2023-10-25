var matcherFns = [
  {
    keyFn: (text) => text.match(/\b[a-zA-Z]/g)?.join("")
  }
]

browser.contextMenus.create({
  id: "add-item",
  title: "Add %s to LOAF",
  contexts: ["selection"]
})

browser.contextMenus.create({
  id: "search-item",
  title: "What is %s",
  contexts: ["selection"]
})

function addSelectedText(info, tab) {
  browser.storage.session.get(tab.id.toString()).then(result => {
    var acronyms = result[tab.id] || {}
    var selectedText = info.selectionText

    matcherFns.forEach(({ keyFn, valueFn }) => {
      var key = keyFn(selectedText)

      if (key) {
        acronyms[key] = valueFn ? valueFn(selectedText) : selectedText
      }
    })

   browser.storage.session.set({ [tab.id]: acronyms })
  })
}

function findSelectedText(info, tab) {
  browser.storage.session.get(tab.id.toString()).then(result => {
    var retrivedAcronyms = result[tab.id]

    if (retrivedAcronyms) {
      if (retrivedAcronyms[info.selectionText]) {
        browser.notifications.create({
          title: "LOAF Found",
          type: "basic",
          message: retrivedAcronyms[info.selectionText]
        })
      } else {
        browser.notifications.create({
          title: "LOAF Not Found",
          type: "basic",
          message: "No acronyms found"
        })
      }
    } else {
      browser.notifications.create({
        title: "LOAF Not Created Yet",
        type: "basic",
        message: "No acronyms created yet"
      })
    }
  })
}

browser.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "add-item":
      addSelectedText(info, tab)
      break
    case "search-item":
      findSelectedText(info, tab)
  }
})



// function handleBrowserActionClick(tab, _onClickData) {
//   browser.storage.session.get(tab.id.toString()).then(result => {
//     var retrivedAcronyms = result[tab.id]

//     if (retrivedAcronyms) {
//       browser.tabs.executeScript({
//         file: "content_scripts/loafify.js"
//       }).then(_ => {
//         browser.tabs.sendMessage(tab.id, { loafify: retrivedAcronyms })
//       })
//     }
//   })
// }

// browser.browserAction.onClicked.addListener(handleBrowserActionClick)
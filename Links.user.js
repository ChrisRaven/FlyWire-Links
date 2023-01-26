// ==UserScript==
// @name         Links
// @namespace    KrzysztofKruk-FlyWire
// @version      0.1.3.2
// @description  Collects all claimed and completed cells, as well as cells added manually by user
// @author       Krzysztof Kruk
// @match        https://ngl.flywire.ai/*
// @match        https://proofreading.flywire.ai/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ChrisRaven/FlyWire-Links/main/Links.user.js
// @downloadURL  https://raw.githubusercontent.com/ChrisRaven/FlyWire-Links/main/Links.user.js
// @homepageURL  https://github.com/ChrisRaven/FlyWire-Links
// ==/UserScript==


if (!document.getElementById('dock-script')) {
  let script = document.createElement('script')
  script.id = 'dock-script'
  script.src = typeof DEV !== 'undefined' ? 'http://127.0.0.1:5501/FlyWire-Dock/Dock.js' : 'https://chrisraven.github.io/FlyWire-Dock/Dock.js'
  document.head.appendChild(script)
}

let wait = setInterval(() => {
  if (globalThis.dockIsReady) {
    clearInterval(wait)
    main()
  }
}, 100)


let dataFavourites, dataHistory, storage

function main() {
  if (typeof DEV !== 'undefined') {
    document.getElementById('insertNGTopBar').addEventListener('click', e => {
    })
  }

  storage = window.Sifrr.Storage.getStorage('indexeddb')

  let waitForMenuCallback = () => {
    let menu = document.getElementsByClassName('nge-gs-links')
    if (!menu.length) return

    clearInterval(waitForMenu)

    let link = document.createElement('div')
    link.classList.add('nge-gs-link')
    link.innerHTML = '<button title="Press Shift+L to toggle">Links</button>'
    link.addEventListener('click', e => {
      createMainDialog()
    })
    menu[0].appendChild(link)
  }

  let waitForMenu = setInterval(waitForMenuCallback, 100)
  assignGlobalEvents()
}


function getDataFromLS(callback) {
  const historyPromise = storage.get('kk-links-history')
  const favouritesPromise = storage.get('kk-links-favourites')
  Promise.all([historyPromise, favouritesPromise]).then(([historyValues, favouritesValues]) => {
    historyValues = historyValues['kk-links-history']
    dataHistory = historyValues ? JSON.parse(historyValues) : { rows: {} }

    favouritesValues = favouritesValues['kk-links-favourites']
    dataFavourites = favouritesValues ? JSON.parse(favouritesValues) : { rows: {} }

    callback && typeof callback === 'function' && callback()
  })
}


function assignGlobalEvents() {
  document.addEventListener('fetch', e => handleClaimedCell(e))
  document.addEventListener('click', e => handleCompletedCell(e))
}


function handleClaimedCell(e) {
  let response = e.detail.response
  let url = e.detail.url

  if (response.code && response.code === 400) return console.error('Links: code 400')

  if (url.includes('proofreading_drive?') && response && response.root_id && response.ngl_coordinates) {
    let coords = response.ngl_coordinates
  
    // source: webpack:///src/state.ts (FlyWire)
    const coordsSpaced = coords.slice(1, -1).split(" ")
    const xyz = []
    for (const coord of coordsSpaced) {
      if (coord === '') continue
      xyz.push(parseInt(coord))
    }
    coords = xyz

    Dock.getShareableUrl(url => {
      saveEntry({
        id: Dock.getRandomHexString(),
        date: Date.now(),
        segId: response.root_id,
        type: 'history',
        link: url,
        description: '',
        claimed: true,
        completed: false,
        coords: coords
      })
    })
  }
}


function handleCompletedCell(e) {
  if (!e.target.classList.contains('nge_segment')) return
  if (e.target.textContent !== 'Yes') return

  getDataFromLS(() => {
    if (Object.entries(dataHistory.rows).length) {
      Dock.getRootIdByCurrentCoords(rootId => findLastFiveClaimedCells_step1(rootId))
    }
  })
}


function findLastFiveClaimedCells_step1(rootId) {
  let claimed = []
  Object.values(dataHistory.rows).forEach(entry => {
    if (entry.claimed) {
      claimed.push({
        rowId: entry.id,
        segId: entry.segId,
        coords: entry.coords,
        date: entry.date
      })
    }
  })

  let lastFive = claimed.sort((a, b) => {
    if (a.date < b.date) return -1
    if (a.date === b.date) return 0
    if (a.date > b.date) return 1
  }).slice(-5)

  let x = [], y = [], z = []
  lastFive.forEach(el => {
    if (el.coords) {
      x.push(el.coords[0])
      y.push(el.coords[1])
      z.push(el.coords[2])
    }
  })

  x.length && findRootSegments_step2(x, y, z, lastFive, rootId)
}


function findRootSegments_step2(x, y, z, lastFive, rootId) {
  Dock.getSegmentId(x, y, z, segmentIds => {
    let promises = segmentIds.map(segmentId => Dock.getRootId(segmentId, null, true))

    Promise.all(promises)
      .then(result => Promise.all(result.map(res => res.json())))
      .then(result => updateCompletedRow_step3(result, lastFive, rootId))
  })
}


function updateCompletedRow_step3(result, lastFive, rootId) {
  let found
  result.some((rowRootId, i) => {
    found = rootId === rowRootId.root_id

    if (found) {
      let rowId = lastFive[i].rowId
      getDataFromLS(() => {
        dataHistory.rows[rowId].completed = true
        save('history', dataHistory)
      })
    }

    return found
  })

  if (!found) {
    Dock.getShareableUrl(url => {
      saveEntry({
        id: Dock.getRandomHexString(),
        date: Date.now(),
        type: 'history',
        link: url,
        description: '',
        claimed: false,
        completed: true
      })
    })
  }
}


function createMainDialog() {
  getDataFromLS(() => {
    let dialog = Dock.dialog({
      html: generateHTML(),
      id: 'kk-links',
      css: generateCSS(),
      cancelCallback: () => {},
      cancelLabel: 'Close',
      afterCreateCallback: afterCreateCallback,
      width: '70vw',
      destroyAfterClosing: true
    })

    dialog.show()
  })
}


function generateHTML() {
  return /*html*/`
    <div id="kk-links-main-tabs">
      <div id="kk-links-favourites-tab" class="links-tab active">Favourites</div>
      <div id="kk-links-history-tab" class="links-tab">History</div>
    </div>
    <div id="kk-links-favourites-panel" class="links-panel active">
      <button id="kk-links-favourites-add-button">Add</button>
      <button id="kk-links-favourites-add-current-button">Add current</button>
      <div id="kk-links-favourites"></div>
    </div>
    <div id="kk-links-history-panel" class="links-panel"><div id="kk-links-history"></div></div>
  `
}


function afterCreateCallback() {
  assignEvents()
  fillTables()
}


function assignEvents() {
  // switching tabs
  document.querySelectorAll('.links-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.links-tab').forEach(tab => tab.classList.remove('active'))
      tab.classList.add('active')
      document.querySelectorAll('.links-panel').forEach(panel => panel.classList.remove('active'))
      let currentPanel = document.getElementById(tab.id.slice(0, -4) + '-panel')
      currentPanel.classList.add('active')
    })
  })

  // row buttons
  document.getElementById('kk-links').addEventListener('click', (e) => {
    let list = e.target.classList
    if (!list.contains('kk-links-button')) return

    let row = e.target.parentNode.parentNode
    
    if (list.contains('edit')) return editHandler(row)
    if (list.contains('copy')) return copyHandler(row)
    if (list.contains('delete')) return deleteHandler(row)
    if (list.contains('update')) return updateHandler(row)
  })

  // add empty
  document.getElementById('kk-links-favourites-add-button').addEventListener('click', e => {
    editDialog({
      type: 'favourites',
      rowId: null,
      link: '',
      description: '',
      destroyAfterClosing: true
    })
  })

  // add with current state as link
  document.getElementById('kk-links-favourites-add-current-button').addEventListener('click', e => {
    Dock.getShareableUrl(url => {
      editDialog({
        type: 'favourites',
        rowId: null,
        link: url,
        description: '',
        destroyAfterClosing: true
      })
    })
  })
}


function getTable(row) {
  let node = row.parentNode

  if (node.tagName === 'TABLE') return node.id

  do {
    node = node.parentNode
  }
  while (node.tagName !== 'TABLE' && node.tagName !== 'BODY')

  if (node.tagName === 'BODY') return null
  
  return node
}


function editHandler(row) {
  let link = row.getElementsByClassName('link')[0].firstChild.href
  let description = row.getElementsByClassName('description')[0].textContent
  let type = document.getElementById(getTable(row).id).dataset.type
  let claimed = type === 'history' ? (row.getElementsByClassName('claimed')[0].textContent === 'o') : false
  let completed = type === 'history' ? (row.getElementsByClassName('completed')[0].textContent === 'o') : false

  editDialog({
    type: type,
    rowId: row.id,
    link: link,
    description: description,
    claimed: claimed,
    completed: completed
  })
}


function editDialog({ type, rowId, link, description, claimed, completed }) {

  function generateHTML() {
    return /*html*/`
      <input value="${link}"><br />
      <textarea>${description}</textarea>
      ${
        type === 'history' ?
        `<label><input type="checkbox" class="claimed"{${claimed ? " checked" : ''}/>claimed</label>
        <label><input type="checkbox" class="completed"{${completed ? " checked" : ''}/>completed</label>`
      : ''
      }
    `
  }

  function okCallback() {
    let dialogNode = document.getElementById('kk-links-edit')
    let link = dialogNode.getElementsByTagName('input')[0].value
    let description = dialogNode.getElementsByTagName('textarea')[0].value
    let td = dialogNode.getElementsByClassName('claimed')
    let claimed = td.length ? td[0].checked : false
        td = dialogNode.getElementsByClassName('completed')
    let completed = td.length ? td[0].checked : false

    addEntry({
      type: type,
      rowId: rowId,
      link: link,
      description: description,
      claimed: claimed,
      completed: completed
    })
  }

  let dialog = Dock.dialog({
    id: 'kk-links-edit',
    html: generateHTML(),
    okCallback: okCallback,
    okLabel: 'Save',
    cancelCallback: () => {},
    destroyAfterClosing: true,
    width: 250
  })

  dialog.show()
}


function addEntry({ rowId, type, link, description, claimed, completed }) {
  let tableNode = document.getElementById('kk-links-' + type + '-table')
  let dataSource = type === 'history' ? dataHistory : dataFavourites
  let createRow = type === 'history' ? createHistoryRow : createFavRow
  let updateRow = type === 'history' ? updateHistoryRow : updateFavRow

  if (typeof description === 'undefined') {
    description = ''
  }

  if (!tableNode) return

  if (rowId) {
    let args = {
      id: rowId,
      link: link,
      description: description,
      claimed: !!claimed,
      completed: !!completed,
      type: type
    }

    updateEntry(args)
    updateRow(args)
    
  }
  else {
    let args = {
      id: Dock.getRandomHexString(),
      date: Date.now(),
      link: link,
      description: description,
      claimed: !!claimed,
      completed: !!completed,
      type: type
    }

    saveEntry(args)
    let row = createRow(args)
    
    tableNode.getElementsByTagName('tbody')[0].insertAdjacentHTML('beforeend', row)
    tableNode.style.visibility = 'visible'
  }

  save(type, dataSource)
}


function save(type, dataSource) {
  storage.set('kk-links-' + type, JSON.stringify(dataSource))
}


function saveEntry(args) {
  getDataFromLS(() => {
    let dataSource = args.type === 'history' ? dataHistory : dataFavourites
    dataSource.rows[args.id] = args
  
    save(args.type, dataSource)
  })
}


function updateEntry(args) {
  getDataFromLS(() => {
    let dataSource = args.type === 'history' ? dataHistory : dataFavourites
    Object.assign(dataSource.rows[args.id], args)
  
    save(args.type, dataSource)
  })
}


function createFavRow({ id, date, link, description }) {
  return /*html*/`<tr id="${id}">
    <td class="date">${new Date(date).toLocaleString()}</td>
    <td class="link"><a href="${link}" target="_blank">${link}</a></td>
    <td class="description">${description}</td>
    <td class="actions">
      <button class="kk-links-button edit">Edit</button>
      <button class="kk-links-button copy">Copy</button>
      <button class="kk-links-button delete">Delete</button>
      <button class="kk-links-button update">Update</button>
    </td>
  </tr>`
}


function updateFavRow({ id, link, description }) {
  let rowNode = document.getElementById(id)
  let linkNode = rowNode.getElementsByClassName('link')[0].firstChild
  let descriptionNode = rowNode.getElementsByClassName('description')[0]

  linkNode.href = link
  linkNode.textContext = link
  descriptionNode.textContent = description
}


function createFavTable() {
  let html = '<table id="kk-links-favourites-table" data-id="kk-links-favourites" data-type="favourites">'
  html += '<tr><th>Date</th><th>Link</th><th>Description</th><th>Actions</th></tr>'

  let dataExists = Object.keys(dataFavourites).length && dataFavourites.rows && Object.keys(dataFavourites.rows).length

  if (dataExists) {
    for (const [id, row] of Object.entries(dataFavourites.rows)) {
      html += createFavRow({
        id: id,
        date: row.date,
        link: row.link,
        description: row.description
      })
    }
  }
  html += '</table>'

  return {
    html: html,
    numberOfRows: dataExists ? Object.entries(dataFavourites.rows).length : 0
  }
}


function createHistoryRow({ id, date, link, description, claimed, completed }) {
  return /*html*/`<tr id="${id}">
    <td class="date">${ new Date(date).toLocaleString()}</td>
    <td class="link"><a href="${link}" target="_blank">${link}</a></td>
    <td class="description">${description}</td>
    <td class="claimed">${claimed ? 'o' : ''}</td>
    <td class="completed">${completed ? 'o' : ''}</td>
    <td class="actions">
      <button class="kk-links-button edit">Edit</button>
      <button class="kk-links-button copy">Copy</button>
      <button class="kk-links-button delete">Delete</button>
    </td>
    </tr>`
}


function updateHistoryRow({ id, link, description, claimed, completed }) {
  let rowNode = document.getElementById(id)
  let linkNode = rowNode.getElementsByClassName('link')[0].firstChild
  let descriptionNode = rowNode.getElementsByClassName('description')[0]
  let claimedNode = rowNode.getElementsByClassName('claimed')[0]
  let completedNode = rowNode.getElementsByClassName('completed')[0]

  linkNode.href = link
  linkNode.textContext = link
  descriptionNode.textContent = description
  claimedNode.textContent = claimed ? 'o' : ''
  completedNode.textContent = completed ? 'o' : ''
}


function createHistoryTable() {
  let html = '<table id="kk-links-history-table" data-id="kk-links-history-table" data-type="history">'
  html += '<tr><th>Date</th><th>Link</th><th>Description</th><th>Claimed</th><th>Completed</th><th>Actions</th></tr>'

  let dataExists = Object.keys(dataHistory).length && dataHistory.rows && Object.keys(dataHistory.rows).length

  if (dataExists) {
    for (const [id, row] of Object.entries(dataHistory.rows)) {
      html += createHistoryRow({
        id: id,
        date: row.date,
        link: row.link,
        description: row.description,
        claimed: row.claimed,
        completed: row.completed
      })
    }
  }
  html += '</table>'

  return {
    html: html,
    numberOfRows: dataExists ? Object.entries(dataHistory.rows).length : 0
  }
}


function copyHandler(row) {
  let link = row.getElementsByClassName('link')[0].firstChild.href
  navigator.clipboard.writeText(link)
}


function deleteHandler(row) {

  function deleteEntry() {
    let tableNode = getTable(row)
    let type = tableNode.dataset.type
    let dataSource = type === 'history' ? dataHistory : dataFavourites

    try {
      delete dataSource.rows[row.id]
      row.remove()
      if (!Object.entries(dataSource.rows).length) {
        tableNode.style.visibility = 'hidden'
      }
      save(type, dataSource)
    }
    catch (e) {
      console.log('Links: entry probably doesn\'t exist')
    }
  }

  let deleteDialog = Dock.dialog({
    id: 'kk-links-delete',
    html: '<div>Do you want to delete this entry?</div>',
    okCallback: deleteEntry,
    okLabel: 'Yes',
    cancelLabel: 'No',
    cancelCallback: () => {},
    destroyAfterClosing: true
  })

  deleteDialog.show()
}


function updateHandler(row) {
  let tableNode = getTable(row)
  let type = 'favourites'
  let dataSource = dataFavourites
  let description = row.getElementsByClassName('description')[0].textContent

  let updateDialog = Dock.dialog({
    id: 'kk-links-update',
    html: description ? '<div>Do you want to update entry described as "' + description + '"?</div>' : '<div>Do you want to update this entry?</div>',
    okCallback: () => save(type, dataSource),
    cancelCallback: () => {},
    okLabel: 'Yes',
    cancelLabel: 'No',
    destroyAfterClosing: true
  })

  Dock.getShareableUrl(url => {
    dataSource.rows[row.id].link = url
    let link = row.getElementsByClassName('link')[0].getElementsByTagName('a')[0]
    link.innerContent = url
    link.href = url

    updateDialog.show()
  })

  
}


function fillTables() {
  fillTable('kk-links-favourites', createFavTable)
  fillTable('kk-links-history', createHistoryTable)
}


function fillTable(id, creatorCallback) {
  let table = creatorCallback()
  let wrapperNode = document.getElementById(id)
  wrapperNode.innerHTML = table.html

  if (!table.numberOfRows) {
    wrapperNode.getElementsByTagName('table')[0].style.visibility = 'hidden'
  }
}


function generateCSS() {
  return /*css*/`
    #kk-links {
      width: 70vw;
      height: 70vh;
      color: white;
      font-size: 14px;
    }

    .links-tab {
      display: inline-block;
      width: 100px;
      height: 20px;
      border: 1px solid #CCC;
      border-radius: 4px 4px 0 0;
      background-color: #333;
      padding: 6px 4px 4px 4px;
      position: relative;
      z-index: 1;
      text-align: center;
      cursor: pointer;
    }

    .links-tab.active {
      background-color: #222;
      border-bottom: none;
      top: 1px;
    }

    .links-panel {
      height: 90%;
      display: none;
      padding: 20px;
      background-color: #222;
      border: 1px solid #CCC;
      position: relative;
      top: -1px;
    }

    .links-panel.active {
      display: block;
    }

    #kk-links-history,
    #kk-links-favourites {
      max-height: 95%;
      overflow: auto;
    }

    #kk-links-history-table tr:first-child,
    #kk-links-favourites-table tr:first-child {
      position: sticky;
      top: 0;
    }

    .links-panel table {
      margin: auto;
      border-spacing: 2px 0;
    }

    .links-panel table tr {

    }

    .links-panel table th {
      background-color: #555;
      padding: 10px;
    }

    .links-panel table td {
      padding: 4px;
    }

    .links-panel table td.claimed,
    .links-panel table td.completed {
      text-align: center;
    }

    .links-panel table td.actions {
      padding-left: 10px;
    }

    .links-panel table tr:nth-child(even) {
      background-color: #333;
    }

    .links-panel table tr:nth-child(odd) {
      background-color: #272727;
    }

    .links-panel table a {
      text-decoration: none;
      color: #5ad;
    }

    .links-panel table .date {
      width: 150px;
    }

    .links-panel table .link {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .links-panel .actions {
      width: 245px;
    }

    #kk-links-favourites-table .actions {
      width: 330px;
    }

    .links-panel .description {
      width: 400px;
    }

    /* needed stronger selectors */
    #kk-links-favourites-panel > #kk-links-favourites-add-button,
    #kk-links-favourites-panel > #kk-links-favourites-add-current-button {
      width: 100px;
      margin: 5px;
    }

    #kk-links-edit .content > * {
      display: block;
      padding-bottom: 5px;
      width: 240px;
    }

    #kk-links-edit .content textarea {
      height: 70px;
    }
  `
}

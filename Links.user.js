// ==UserScript==
// @name         Links
// @namespace    KrzysztofKruk-FlyWire
// @version      0.1
// @description  Collects all claimed and completed cells, as well as cells added manually by user
// @author       Krzysztof Kruk
// @match        https://ngl.flywire.ai/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ChrisRaven/FlyWire-Links/main/Links.user.js
// @downloadURL  https://raw.githubusercontent.com/ChrisRaven/FlyWire-Links/main/Links.user.js
// @homepageURL  https://github.com/ChrisRaven/FlyWire-Links
// ==/UserScript==



/*! Sifrr.Storage v0.0.9 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
window.Sifrr=this.Sifrr||{},window.Sifrr.Storage=function(t){"use strict";var e=Object.prototype.toString,r="~SS%l3g5k3~";function s(t){var e=t;if("string"==typeof t)try{e=t=JSON.parse(t)}catch(t){// do nothing
}if("string"==typeof t&&t.indexOf(r)>0){var[n,i,a]=t.split(r);e="ArrayBuffer"===n?new Uint8Array(i.split(",").map(t=>parseInt(t))).buffer:"Blob"===n?function(t,e){return new Blob([new Uint8Array(t.split(",")).buffer],{type:e})}(a,i):new window[n](i.split(","))}else if(Array.isArray(t))e=[],t.forEach((t,r)=>{e[r]=s(t)});else if("object"==typeof t){if(null===t)return null;for(var o in e={},t)e[o]=s(t[o])}return e}function n(t){if("object"!=typeof t)return JSON.stringify(t);if(null===t)return"null";if(Array.isArray(t))return JSON.stringify(t.map(t=>n(t)));var s=e.call(t).slice(8,-1);if("Object"===s){var i={};for(var a in t)i[a]=n(t[a]);return JSON.stringify(i)}return"ArrayBuffer"===s?t=new Uint8Array(t):"Blob"===s&&(t=t.type+r+function(t){var e=URL.createObjectURL(t),r=new XMLHttpRequest;r.open("GET",e,!1),r.send(),URL.revokeObjectURL(e);for(var s=new Uint8Array(r.response.length),n=0;n<r.response.length;++n)s[n]=r.response.charCodeAt(n);return s.toString()}(t)),s+r+t.toString()}
// always bind to storage
var i=(t,e)=>{var r=Date.now();return Object.keys(t).forEach(s=>{if(void 0!==t[s]){var{createdAt:n,ttl:i}=t[s];t[s]=t[s]&&t[s].value,0!==i&&r-n>i&&(delete t[s],e&&e(s))}}),t},a=(t,e)=>t&&t.value?(t.ttl=t.ttl||e,t.createdAt=Date.now(),t):{value:t,ttl:e,createdAt:Date.now()},o=(t,e,r)=>{if("string"==typeof t)return{[t]:a(e,r)};var s={};return Object.keys(t).forEach(e=>s[e]=a(t[e],r)),s},c=t=>Array.isArray(t)?t:[t],l={name:"SifrrStorage",version:1,description:"Sifrr Storage",size:5242880,ttl:0};class u{constructor(t=l){this.type=this.constructor.type,this.table={},Object.assign(this,l,t),this.tableName=this.name+this.version}// overwrited methods
select(t){var e=this.getStore(),r={};return t.forEach(t=>r[t]=e[t]),r}upsert(t){var e=this.getStore();for(var r in t)e[r]=t[r];return this.setStore(e),!0}delete(t){var e=this.getStore();return t.forEach(t=>delete e[t]),this.setStore(e),!0}deleteAll(){return this.setStore({}),!0}getStore(){return this.table}setStore(t){this.table=t}keys(){return Promise.resolve(this.getStore()).then(t=>Object.keys(t))}all(){return Promise.resolve(this.getStore()).then(t=>i(t,this.del.bind(this)))}get(t){return Promise.resolve(this.select(c(t))).then(t=>i(t,this.del.bind(this)))}set(t,e){return Promise.resolve(this.upsert(o(t,e,this.ttl)))}del(t){return Promise.resolve(this.delete(c(t)))}clear(){return Promise.resolve(this.deleteAll())}memoize(t,e=((...t)=>"string"==typeof t[0]?t[0]:n(t[0]))){return(...r)=>{var s=e(...r);return this.get(s).then(e=>{if(void 0===e[s]||null===e[s]){var n=t(...r);if(!(n instanceof Promise))throw Error("Only promise returning functions can be memoized");return n.then(t=>this.set(s,t).then(()=>t))}return e[s]})}}isSupported(t=!0){return!(!t||"undefined"!=typeof window&&"undefined"!=typeof document)||!(!window||!this.hasStore())}hasStore(){return!0}isEqual(t){return this.tableName==t.tableName&&this.type==t.type}// aliases
static stringify(t){return n(t)}static parse(t){return s(t)}static _add(t){this._all=this._all||[],this._all.push(t)}static _matchingInstance(t){for(var e=this._all||[],r=e.length,s=0;s<r;s++)if(e[s].isEqual(t))return e[s];return this._add(t),t}}class h extends u{constructor(t){return super(t),this.constructor._matchingInstance(this)}select(t){var e={},r=[];return t.forEach(t=>r.push(this._tx("readonly","get",t,void 0).then(r=>e[t]=r))),Promise.all(r).then(()=>e)}upsert(t){var e=[];for(var r in t)e.push(this._tx("readwrite","put",t[r],r));return Promise.all(e).then(()=>!0)}delete(t){var e=[];return t.forEach(t=>e.push(this._tx("readwrite","delete",t,void 0))),Promise.all(e).then(()=>!0)}deleteAll(){return this._tx("readwrite","clear",void 0,void 0)}_tx(t,e,r,s){var n=this;return this.store=this.store||this.createStore(n.tableName),this.store.then(i=>new Promise((a,o)=>{var c=i.transaction(n.tableName,t).objectStore(n.tableName),l=c[e].call(c,r,s);l.onsuccess=t=>a(t.target.result),l.onerror=t=>o(t.error)}))}getStore(){return this._tx("readonly","getAllKeys",void 0,void 0).then(this.select.bind(this))}createStore(t){return new Promise((e,r)=>{var s=window.indexedDB.open(t,1);s.onupgradeneeded=()=>{s.result.createObjectStore(t)},s.onsuccess=()=>e(s.result),s.onerror=()=>r(s.error)})}hasStore(){return!!window.indexedDB}static get type(){return"indexeddb"}}class p extends u{constructor(t){return super(t),this.constructor._matchingInstance(this)}parsedData(){}select(t){var e=t.map(()=>"?").join(", ");// Need to give array for ? values in executeSql's 2nd argument
return this.execSql("SELECT key, value FROM ".concat(this.tableName," WHERE key in (").concat(e,")"),t)}upsert(t){return this.getWebsql().transaction(e=>{for(var r in t)e.executeSql("INSERT OR REPLACE INTO ".concat(this.tableName,"(key, value) VALUES (?, ?)"),[r,this.constructor.stringify(t[r])])}),!0}delete(t){var e=t.map(()=>"?").join(", ");return this.execSql("DELETE FROM ".concat(this.tableName," WHERE key in (").concat(e,")"),t),!0}deleteAll(){return this.execSql("DELETE FROM ".concat(this.tableName)),!0}getStore(){return this.execSql("SELECT key, value FROM ".concat(this.tableName))}hasStore(){return!!window.openDatabase}getWebsql(){return this._store?this._store:(this._store=window.openDatabase("ss",1,this.description,this.size),this.execSql("CREATE TABLE IF NOT EXISTS ".concat(this.tableName," (key unique, value)")),this._store)}execSql(t,e=[]){var r=this;return new Promise(s=>{r.getWebsql().transaction((function(n){n.executeSql(t,e,(t,e)=>{s(r.parseResults(e))})}))})}parseResults(t){for(var e={},r=t.rows.length,s=0;s<r;s++)e[t.rows.item(s).key]=this.constructor.parse(t.rows.item(s).value);return e}static get type(){return"websql"}}class d extends u{constructor(t){return super(t),this.constructor._matchingInstance(this)}select(t){var e={};return t.forEach(t=>{var r=this.constructor.parse(this.getLocalStorage().getItem(this.tableName+"/"+t));null!==r&&(e[t]=r)}),e}upsert(t){for(var e in t)this.getLocalStorage().setItem(this.tableName+"/"+e,this.constructor.stringify(t[e]));return!0}delete(t){return t.map(t=>this.getLocalStorage().removeItem(this.tableName+"/"+t)),!0}deleteAll(){return Object.keys(this.getLocalStorage()).forEach(t=>{0===t.indexOf(this.tableName)&&this.getLocalStorage().removeItem(t)}),!0}getStore(){return this.select(Object.keys(this.getLocalStorage()).map(t=>{if(0===t.indexOf(this.tableName))return t.slice(this.tableName.length+1)}).filter(t=>void 0!==t))}getLocalStorage(){return window.localStorage}hasStore(){return!!window.localStorage}static get type(){return"localstorage"}}var f=new Date(0).toUTCString(),g="%3D",S=new RegExp(g,"g");class v extends u{constructor(t){return super(t),this.constructor._matchingInstance(this)}upsert(t){for(var e in t)this.setStore("".concat(this.tableName,"/").concat(e,"=").concat(this.constructor.stringify(t[e]).replace(/=/g,g),"; path=/"));return!0}delete(t){return t.forEach(t=>this.setStore("".concat(this.tableName,"/").concat(t,"=; expires=").concat(f,"; path=/"))),!0}deleteAll(){return this.keys().then(this.delete.bind(this))}getStore(){var t=document.cookie,e={};return t.split("; ").forEach(t=>{var[r,s]=t.split("=");0===r.indexOf(this.tableName)&&(e[r.slice(this.tableName.length+1)]=this.constructor.parse(s.replace(S,"=")))}),e}setStore(t){document.cookie=t}hasStore(){return void 0!==document.cookie}static get type(){return"cookies"}}class y extends u{constructor(t){return super(t),this.constructor._matchingInstance(this)}hasStore(){return!0}static get type(){return"jsonstorage"}}var m={[h.type]:h,[p.type]:p,[d.type]:d,[v.type]:v,[y.type]:y};return t.Cookies=v,t.IndexedDB=h,t.JsonStorage=y,t.LocalStorage=d,t.WebSQL=p,t.availableStores=m,t.getStorage=function(t){return function(t=[],e={}){t=t.concat([h.type,p.type,d.type,v.type,y.type]);for(var r=0;r<t.length;r++){var s=m[t[r]];if(s){var n=new s(e);if(n.isSupported())return n}}throw Error("No compatible storage found. Available types: "+Object.keys(m).join(", ")+".")}("string"==typeof t?[t]:(t||{}).priority,"string"==typeof t?{}:t)},t.default&&(t=t.default),t}({});
/*! (c) @aadityataparia */



let storage = window.Sifrr.Storage.getStorage('indexeddb')

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


let dataFavourites, dataHistory

function main() {

  if (typeof DEV !== 'undefined') {
    document.getElementById('insertNGTopBar').addEventListener('click', e => {
    })
  }

  let waitForMenuCallback = () => {
    let menu = document.getElementsByClassName('nge-gs-links')
    if (!menu.length) return

    clearInterval(waitForMenu)

    let link = document.createElement('div')
    link.classList.add('nge-gs-link')
    link.innerHTML = '<button title="Press Shift+L to toggle">Links</button>'
    link.addEventListener('click', e => {
      createMainDialog().show()
    })
    menu[0].appendChild(link)
  }

  let waitForMenu = setInterval(waitForMenuCallback, 100)

  storage.get('kk-links-history').then(values => {
    values = values['kk-links-history']
    dataHistory = values ? JSON.parse(values) : { rows: {} }
  })

  storage.get('kk-links-favourites').then(values => {
    values = values['kk-links-favourites']
    dataFavourites = values ? JSON.parse(values) : { rows: {} }
  })

  assignGlobalEvents()
}


function assignGlobalEvents() {
  document.addEventListener('fetch', e => {
    let response = e.detail.response
    let url = e.detail.url

    if (response.code && response.code === 400) return console.error('Links: code 400')

    if (url.includes('proofreading_drive?') && response && response.root_id) {
      Dock.getShareableUrl(url => {
        saveEntry({
          id: Dock.getRandomHexString(),
          date: Date.now(),
          segId: response.root_id,
          type: 'history',
          link: url,
          description: '',
          claimed: true,
          completed: false
        })
      })
    }
  })

  // completed
  document.addEventListener('click', e => {
    if (!e.target.classList.contains('nge_segment')) return
    if (e.target.textContent !== 'Yes') return

    // current rootId
    let arrayed = []
    let rowId = null
    if (dataHistory.rows.length) {
      Dock.getRootIdByCurrentCoords(rootId => {
        dataHistory.rows.forEach(entry => {
          if (entry.claimed) {
            arrayed.push({
              rowId: entry.rowId,
              segId: entry.segId
            })
          }
        })
      })

      let lastFive = arrayed.slice(-5).reverse()
      
      // if there are any claimed cells in the table...
      if (lastFive.length) {
        // ...get rootId of the last one
        let segId = lastFive[0].segId
        if (segId) {
          Dock.getRootId(segId, entryRootId => {
            if (rootId === entryRootId) {
              rowId = lastFive[0].rowId
            }
          })
        }
      }

      // if the last claimed cell isn't the correct one,
      // check four previous ones (if they exists)
      if (!rowId && lastFive.length > 1) {
        for (const i = 1; i < lastFive.length; i++) {
          let segId = lastFive[i].segId
          if (segId) {
            Dock.getRootId(segId, entryRootId => {
              if (rootId === entryRootId) {
                rowId = lastFive[i].rowId
              }
            })
          }
        }
      }
    }

    Dock.getShareableUrl(link => {
      let args = {
        id: rowId || Dock.getRandomHexString(),
        type: 'history',
        link: link,
        claimed: !!rowId,
        completed: true,
        description: '',
        date: Date.now()
      }

      rowId ? updateEntry(args) : saveEntry(args)
    })
  })
}


function createMainDialog() {
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

  return dialog
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
  })

  // add empty
  document.getElementById('kk-links-favourites-add-button').addEventListener('click', e => {
    editDialog({
      type: 'favourites',
      rowId: null,
      link: '',
      description: ''
    })
  })

  // add with current state as link
  document.getElementById('kk-links-favourites-add-current-button').addEventListener('click', e => {
    Dock.getShareableUrl(url => {
      editDialog({
        type: 'favourites',
        rowId: null,
        link: url,
        description: ''
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
    destroyAfterClosing: true
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
  let dataSource = args.type === 'history' ? dataHistory : dataFavourites
  dataSource.rows[args.id] = args

  save(args.type, dataSource)
}


function updateEntry(args) {
  let dataSource = args.type === 'history' ? dataHistory : dataFavourites
  Object.assign(dataSource.rows[args.id], args)

  save(args.type, dataSource)
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

    delete dataSource.rows[row.id]
    row.remove()
    if (!Object.entries(dataSource.rows).length) {
      tableNode.style.visibility = 'hidden'
    }
    save(type, dataSource)
  }

  let deleteDialog = Dock.dialog({
    id: 'kk-links-delete',
    html: '<div>Do you want to delete this entry?</div>',
    okCallback: deleteEntry,
    okLabel: 'Yes',
    cancelCallback: 'No',
    cancelCallback: () => {}
  })

  deleteDialog.show()
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
      width: 150px;
    }
  `
}

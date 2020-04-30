import Vue from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { config, library } from '@fortawesome/fontawesome-svg-core'
import { faEllipsisV, faEdit } from '@fortawesome/free-solid-svg-icons'
import { faBell, faPlusSquare } from '@fortawesome/free-regular-svg-icons'
// import { faChrome } from '@fortawesome/free-brands-svg-icons'

// nuxt.config.jsでCSSファイルを追加
config.autoAddCss = false

// 利用するアイコンを配列に追加
const solidIcons = [faEllipsisV, faEdit]
const regularIcons = [faBell, faPlusSquare]
const bransIcons = []

// 利用するアイコンをlibraryに追加
solidIcons.forEach(icon => library.add(icon))
regularIcons.forEach(icon => library.add(icon))
bransIcons.forEach(icon => library.add(icon))

// グローバルコンポーネントに登録
Vue.component('fa', FontAwesomeIcon)

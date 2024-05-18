import { createApp } from 'vue'

import Popup from './Popup.vue'
import {
  MdExpandcircledown,
  MdCircle,
  MdExpandless,
  MdCleaningservicesRound,
  CoMoodVeryGood,
} from 'oh-vue-icons/icons'
import { OhVueIcon, addIcons } from 'oh-vue-icons'

addIcons(MdExpandcircledown, MdCircle, MdExpandless, MdCleaningservicesRound, CoMoodVeryGood)
const app = createApp(Popup)
app.component('v-icon', OhVueIcon)

app.mount('#app')

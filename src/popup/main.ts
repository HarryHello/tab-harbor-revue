import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PopupApp from './PopupApp.vue'

const app = createApp(PopupApp)
app.use(createPinia())
app.mount('#popup')

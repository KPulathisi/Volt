import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { installDirectives } from './composables/directives.js'
import './styles/main.css'

const app = createApp(App)
installDirectives(app)
app.use(router).mount('#app')

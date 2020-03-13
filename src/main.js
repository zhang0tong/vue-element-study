import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/globe.css'
import './assets/font/iconfont.css'
import axios from 'axios'

axios.defaults.baseURL = 'https://d3cfc7d9-7a4c-4988-a126-d731e3ab7031.mock.pstmn.io/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

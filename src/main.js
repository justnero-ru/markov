import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store/index'
import AsyncComputed from 'vue-async-computed';
import {DropdownPlugin, VBTooltip} from 'bootstrap-vue'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faWalking, faPlay, faEquals, faSave, faEraser} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

library.add(faWalking, faPlay, faEquals, faSave, faEraser);

Vue.use(AsyncComputed);
Vue.directive('b-tooltip', VBTooltip);
Vue.use(DropdownPlugin);
Vue.component('fa-icon', FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');

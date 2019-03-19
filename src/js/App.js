import Vue from 'vue';
import VueRouter from 'vue-router';
import AsyncComputed from 'vue-async-computed';
import store from './store';
import router from './router';
import App from './components/App';

Vue.use(VueRouter);
Vue.use(AsyncComputed);

window.app = new Vue({
    el: '#app',
    store,
    router,
    data: {
        currentMode: 'direct'
    },
    render: h => h(App),
});

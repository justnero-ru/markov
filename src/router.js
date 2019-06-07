import Vue from 'vue';
import VueRouter from 'vue-router';

const DirectMode = () => import(/* webpackChunkName: "direct-mode" */ '@/view/direct-mode');

Vue.use(VueRouter);

const routes = [
    {path: '*', component: DirectMode},
];

export default new VueRouter({
    routes
});

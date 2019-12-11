import Vue from 'vue';
import VueRouter from 'vue-router';

const DirectMode = () => import(/* webpackChunkName: "direct-mode" */ '@/view/direct-mode');
const ReverseMode = () => import(/* webpackChunkName: "reverse-mode" */ '@/view/reverse-mode');
const ResearchMode = () => import(/* webpackChunkName: "research-mode" */ '@/view/research-mode');

Vue.use(VueRouter);

const routes = [
    {path: '/', component: DirectMode},
    {path: '/direct', component: DirectMode},
    {path: '/reverse', component: ReverseMode},
    {path: '/research', component: ResearchMode},
];

export default new VueRouter({
    routes
});

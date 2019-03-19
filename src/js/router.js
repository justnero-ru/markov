import Vue from 'vue';
import VueRouter from 'vue-router';
import DirectMode from "./components/DirectMode";
import ReverseMode from "./components/ReverseMode";
import DoubleMode from "./components/DoubleMode";

Vue.use(VueRouter);

const routes = [
    { path: '/', component: DirectMode },
    { path: '/direct', component: DirectMode },
    { path: '/reverse', component: ReverseMode },
    { path: '/double', component: DoubleMode },
];

export default new VueRouter({
    routes
});

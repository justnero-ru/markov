import Vue from 'vue';

import AsyncComputed from 'vue-async-computed';
import DirectMode from "./components/DirectMode";
import ReverseMode from "./components/ReverseMode";
import DoubleMode from "./components/DoubleMode";

Vue.use(AsyncComputed);

window.app = new Vue({
    el: '#app',
    data: {
        currentMode: 'direct'
    },
    components: {
        direct: DirectMode,
        reverse: ReverseMode,
        double: DoubleMode,
    }
});
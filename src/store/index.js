import Vue from 'vue'
import direct from './modules/direct'
import VuexPersist from 'vuex-persist'
import createLogger from "vuex/dist/logger"
import Vuex from "vuex"

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';
const vuexPersist = new VuexPersist({
    key: 'markov',
    storage: localStorage
});

export default new Vuex.Store({
    modules: {
        direct,
    },
    strict: debug,
    plugins: [vuexPersist.plugin, ...(debug ? [createLogger()] : [])],
})

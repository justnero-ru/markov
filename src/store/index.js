import Vue from 'vue'
import direct from '@/store/modules/direct'
import reverse from '@/store/modules/reverse'
import research from '@/store/modules/research'
import VuexPersist from 'vuex-persist'
import createLogger from 'vuex/dist/logger'
import Vuex from 'vuex'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';
const vuexPersist = new VuexPersist({
    key: 'jetMarkov',
    storage: localStorage
});

export default new Vuex.Store({
    modules: {
        direct,
        reverse,
        research,
    },
    strict: debug,
    plugins: [vuexPersist.plugin, ...(debug ? [createLogger()] : [])],
})

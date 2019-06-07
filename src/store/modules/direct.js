import matrix from '@/store/modules/matrix'

const state = {
    size: 1,
    steps: 10,
    chains: 5,
};

const getters = {

};

const actions = {
    normalize(context) {
        context.commit('replace', context.getters.normalized)
    },
    clear(context) {
        context.commit('clear');
    },
};

const mutations = {
    setChains(state, value) {
        state.chains = value;
    },
    setSteps(state, value) {
        state.steps = value;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        model: matrix,
    }
}

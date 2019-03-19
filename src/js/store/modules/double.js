import direct from './direct';
import multi from './multi-reverse';

const state = {
    eps: 0,
};

// getters
const getters = {
    diff(state) {
        const values = [];
        for (let i = 0; i < state.direct.model.size; i++) {
            for (let j = 0; j < state.direct.model.size; j++) {
                if (state.direct.model.matrix[i][j].value > 0) {
                    values.push({
                        input: parseFloat(state.direct.model.matrix[i][j].value),
                        output: parseFloat(state.multi.intensities[state.multi.iterationCount - 1][i][j].value),
                    });
                }
            }
        }

        return values;
    },
    stdev(state, getters) {
        const diff = getters.diff;
        let sum = 0;
        for (let i = 0; i < diff.length; i++) {
            sum += Math.pow(parseFloat(diff[i].input) - parseFloat(diff[i].output), 2);
        }

        return Math.sqrt(sum / diff.length).toPrecision(4);
    },
};

// actions
const actions = {
    test(context) {
        const {size, steps, chains} = context.state.direct.model;
        return context.dispatch('direct/test')
            .then(() => {
                const transitions = context.state.direct.chains;
                context.dispatch('multi/recover', {size, transitions, steps, chains});
            });
    },
    clear(context, force = false) {
        return context.dispatch('direct/clear', force)
            .then(() => {
                if (!context.state.direct.isTested) {
                    return context.dispatch('resetMulti');
                }
            });
    },
    resetMulti(context) {
        return context.dispatch('multi/clear', true);
    },
};

// mutations
const mutations = {
    setEps(state, value) {
        state.eps = value;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        direct: direct,
        multi: multi
    }
}

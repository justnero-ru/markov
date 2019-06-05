import direct from './direct';
import multi from './multi-reverse';

const state = {
    eps: 0,
    distribution: 'uniform',
    distributionA: 0,
    distributionB: 1,
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
    test({state, dispatch}) {
        const {size, steps, chains} = state.direct.model;
        const distributionConfig = {
            distribution: state.distribution,
            A: state.distributionA,
            B: state.distributionB,
        };
        return dispatch('direct/test')
            .then(() => {
                const transitions = state.direct.chains;
                dispatch('multi/recover', {size, transitions, steps, chains, distributionConfig});
            });
    },
    clear({state, dispatch}, force = false) {
        return dispatch('direct/clear', force)
            .then(() => {
                if (!state.direct.isTested) {
                    return dispatch('resetMulti');
                }
            });
    },
    resetMulti({dispatch}) {
        return dispatch('multi/clear', true);
    },
};

// mutations
const mutations = {
    setEps(state, value) {
        state.eps = value;
    },
    setDistribution(state, value) {
        state.distribution = value;
    },
    setDistributionA(state, value) {
        state.distributionA = parseFloat(value);
    },
    setDistributionB(state, value) {
        state.distributionB = parseFloat(value);
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

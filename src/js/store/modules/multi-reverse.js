import {cloneDeep} from 'lodash';
import MultiReverseMarkovChain from '../../classes/MultiReverseMarkovChain';

const state = {
    iterationCount: 1,
    intensities: [],
    transitions: [],
    isGenerated: false,
};

// getters
const getters = {
    configs(state) {
        const configs = [];
        for (let i = 0; i < state.intensities.length; i++) {
            configs.push({
                matrix: cloneDeep(state.intensities[i]),
                stateVisits: cloneDeep(state.stateVisits[i]),
                transitions: [],
                transition: false,
                deadEnds: [],
            });
        }
        return configs;
    },
};

// actions
const actions = {
    recover(context, {size, transitions, steps, chains}) {
        const calculator = new MultiReverseMarkovChain(size, context.state.iterationCount, cloneDeep(transitions)),
            result = calculator.generate(steps, chains);
        context.commit('setResults', result);
    },
    clear(context) {
        context.commit('clear');
    },
};

// mutations
const mutations = {
    setIterationCount(state, value) {
        state.iterationCount = value;
    },
    setResults(state, {intensities, transitions, stateVisits}) {
        state.isGenerated = true;
        state.intensities = cloneDeep(intensities);
        state.transitions = cloneDeep(transitions);
        state.stateVisits = cloneDeep(stateVisits);
    },
    clear(state) {
        state.isGenerated = false;
        state.intensities = [];
        state.transitions = [];
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}

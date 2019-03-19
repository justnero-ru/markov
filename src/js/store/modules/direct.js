import {cloneDeep} from 'lodash';
import matrix from './matrix';
import DirectMarkovChain from "../../classes/DirectMarkovChain";
import Cell from "../../classes/Cell";
import TestResult from "../../classes/TestResult";

const state = {
    calculator: false,
    transition: false,
    isChainEnded: false,
    chain: [0],
    isTested: false,
    chains: [],
    deadEnds: [],
    testResults: [],
};

// getters
const getters = {
    config(state) {
        return {
            matrix: state.model.matrix,
            stateVisits: state.isTested ? state.testResults.stateVisits : state.calculator.stateVisits,
            transitions: state.isTested ? state.testResults.transitions : state.calculator.transitionMatrix,
            transition: state.isTested ? false : state.transition,
            deadEnds: state.deadEnds,
        };
    },
    chainsAsText(state) {
        let text = `N = ${state.model.size}\r\n\r\n`;
        if (state.chains.length === 0) {
            for (let i = 0; i < state.chain.length; i++) {
                if (i > 0) {
                    text += ' ';
                }
                text += state.chain[i];
            }
            text += "\r\n";
        } else {
            for (let k = 0; k < state.chains.length; k++) {
                let chain = state.chains[k];
                text += chain[0].from;
                for (let i = 0; i < chain.length; i++) {
                    text += ` ${chain[i].to}`;
                }
                text += "\r\n";
            }
        }
        return text;
    },
};

// actions
const actions = {
    matrixChange(context, {x, y, value, mode}) {
        context.commit('model/set', {x, y, value, mode});
        context.commit('init');
    },
    step(context) {
        if (context.state.calculator === false) {
            context.commit('init');
        }
        context.commit('transition');
        if (context.state.transition === false) {
            context.dispatch('reset');
        }
    },
    test(context) {
        context.commit('clearTest');

        const {matrix, steps, size, chains: chainCount} = context.state.model,
            direct = new DirectMarkovChain(cloneDeep(matrix)),
            chains = [];
        let testResults = direct.test(chainCount, steps);
        let transitions = new Array(size),
            stateVisits = new Array(size),
            deadEnds = [];
        for (let i = 0; i < size; i++) {
            stateVisits[i] = 0;
            transitions[i] = new Array(size);
            for (let j = 0; j < size; j++) {
                transitions[i][j] = new Cell();
            }
        }
        for (let k = 0; k < testResults.length; k++) {
            chains.push(testResults[k].chain);
            if (testResults[k].stepCount < steps) {
                deadEnds.push(testResults[k].lastPosition);
            }
            for (let i = 0; i < size; i++) {
                stateVisits[i] += testResults[k].stateVisits[i];
                for (let j = 0; j < size; j++) {
                    transitions[i][j].value += testResults[k].transitions[i][j].value;
                }
            }
        }
        context.commit('saveTest', {
            chains,
            deadEnds,
            testResults: new TestResult(transitions, false, steps, stateVisits)
        });
    },
    clear(context, force = false) {
        if (context.state.isTested) {
            context.commit('clearTest');
        } else if (force || !context.state.isTested) {
            context.commit('clearModel');
            context.dispatch('model/clear')
                .then(() => context.dispatch('reset'));
        }
    },
    reset(context) {
        if (context.state.calculator === false) {
            context.commit('init');
        } else {
            context.commit('reset');
        }
    }
};

// mutations
const mutations = {
    init(state) {
        state.calculator = new DirectMarkovChain(cloneDeep(state.model.matrix));
    },
    reset(state) {
        state.calculator = new DirectMarkovChain(cloneDeep(state.model.matrix));
    },
    transition(state) {
        const transition = state.calculator.next();
        state.transition = transition;
        if (transition.to === null) {
            state.transition = false;
            state.isChainEnded = true;
            state.chainEnd = [];
        } else {
            if (state.isChainEnded) {
                state.isChainEnded = false;
                state.chain = [transition.from];
            }
            state.chain.push(transition.to);
        }
    },
    saveTest(state, {chains, deadEnds, testResults}) {
        state.isTested = true;
        state.chains = chains;
        state.deadEnds = deadEnds;
        state.testResults = testResults;
        state.chain = [];
        state.transition = false;
        state.calculator = false;
    },
    clearModel(state) {
        state.deadEnds = [];
        state.chain = [];
        state.transition = false;
        state.calculator = false;
    },
    clearTest(state) {
        state.isTested = false;
        state.testResults = [];
        state.transition = false;
        state.chains = [];
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        model: matrix
    }
}

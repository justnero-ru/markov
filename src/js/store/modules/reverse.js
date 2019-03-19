import matrix from './matrix';
import ReverseMarkovChain from '../../classes/ReverseMarkovChain';
import Transition from '../../classes/Transition';
import Cell from "../../classes/Cell";
import TestResult from "../../classes/TestResult";

const state = {
    calculator: false,
    modelText: '',
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
    modelTransitions(state) {
        let transitions = [],
            stateList = state.modelText
                .split("\n")
                .filter(line => line.trim().length > 0)
                .map(line => line
                    .trim()
                    .split(' ')
                    .map(state => parseInt(state.trim()))
                    .filter(state => typeof state === 'number' && state >= 0)
                );
        for (let k = 0; k < stateList.length; k++) {
            for (let i = 1; i < stateList[k].length; i++) {
                transitions.push(new Transition(stateList[k][i - 1], stateList[k][i]));
            }
        }
        return transitions;
    },
};

// actions
const actions = {
    rebuild(context, transitions) {
        const reverse = new ReverseMarkovChain(context.state.model.size, transitions || context.getters.modelTransitions);
        context.commit('model/replace', reverse.intensivityMatrix);
    },
    changeModel(context, text) {
        context.commit('setModel', text);
        context.dispatch('rebuild');
    },
    step(context) {
        if (context.state.calculator === false) {
            context.commit('init', context.getters.modelTransitions);
        }
        context.commit('transition');
        if (context.state.transition === false) {
            context.dispatch('reset');
        }
    },
    test(context) {
        context.commit('clearTest');

        const {size, steps, chains: chainCount} = context.state.model,
            reverse = new ReverseMarkovChain(size, context.getters.modelTransitions),
            chains = [];
        let testResults = reverse.test(chainCount, steps);
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
    loadFromTransitions(context, {size, transitions}) {
        context.commit('model/resize', size);
        context.commit('init', transitions);
        return context.dispatch('rebuild', transitions);
    },
    loadFromText(context, text) {
        const lines = text
            .split("\n")
            .map(line => line.trim());

        const N = lines[0].split('=').map(part => part.trim())[1];

        if (N > 0) {
            const model = lines.slice(1)
                .filter(line => line.trim().length > 0)
                .join("\n");

            let promise;
            if (context.state.isTested) {
                promise = context.dispatch('clear')
                    .then(() => context.dispatch('clear'));
            } else {
                promise = context.dispatch('clear');
            }

            return promise.then(() => {
                context.commit('model/resize', N);
                context.dispatch('changeModel', model);
            });
        }
        return false;
    },
    clear(context, force = false) {
        if (context.state.isTested) {
            context.commit('clearTest');
        } else if(force || !context.state.isTested) {
            context.commit('clearModel');
            context.dispatch('model/clear')
                .then(() => context.commit('reset'));
        }
    },
};

// mutations
const mutations = {
    init(state, modelTransitions) {
        state.calculator = new ReverseMarkovChain(state.model.size, modelTransitions);
    },
    reset(state) {
        state.calculator && state.calculator.reset();
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
    setModel(state, text) {
        state.modelText = text;
    },
    saveTest(state, {chains, deadEnds, testResults}) {
        state.isTested = true;
        state.chains = chains;
        state.deadEnds = deadEnds;
        state.testResults = testResults;
    },
    clearModel(state) {
        state.deadEnds = [];
        state.modelText = '';
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

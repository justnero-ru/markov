import Vue from 'vue'
import Cell from '@/util/Cell'
import State, {STATE_IDLE, STATE_PREVIOUS} from '@/util/State'
import {getStep} from "@/util/Model";

const state = {
    size: 2,
    matrix: [[Cell.empty(), Cell.empty()], [Cell.empty(), Cell.empty()]],
    states: [State.build(STATE_IDLE, 1, 0), State.empty()],
    current: 0,
    chains: [[0]],
};

const normalize = function ({matrix, size}) {
    const normalized = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        const sum = matrix[i].reduce((sum, cell) => sum + cell.value, 0);
        for (let j = 0; j < size; j++) {
            if (sum) {
                row.push(Cell.normalized(matrix[i][j], sum));
            } else {
                row.push(Cell.empty());
            }
        }
        normalized.push(row);
    }

    return normalized;
};

const getters = {
    normalized({matrix, size}) {
        return normalize({matrix, size});
    },
    statesNormalized({states, size}) {
        const normalized = [];
        const sum = states.reduce((sum, state) => sum + state.visits, 0);
        for (let i = 0; i < size; i++) {
            normalized.push(State.normalized(states[i], sum));
        }

        return normalized;
    },
    transitions({size, matrix, chains}) {
        const transitions = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                row.push(Cell.alter(matrix[i][j], 0));
            }
            transitions.push(row);
        }
        for (let i = 0; i < chains.length; i++) {
            for (let j = 1; j < chains[i].length; j++) {
                const x = chains[i][j - 1];
                const y = chains[i][j];
                transitions[x][y].value++;
            }
        }

        return transitions;
    },
    transitionsNormalized({size}, {transitions}) {
        return normalize({matrix: transitions, size});
    },
    frequency({size}, {transitions}) {
        const frequency = [];
        const sum = transitions.reduce((sum, row) => sum + row.reduce((sum, cell) => sum + cell.value, 0), 0);
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                if (sum) {
                    row.push(Cell.normalized(transitions[i][j], sum));
                } else {
                    row.push(Cell.empty());
                }
            }
            frequency.push(row);
        }

        return frequency;
    },
    transitionsPlain({chains}) {
        return chains.map(chain => chain.join(' ')).join('\n');
    },
    transitionsHumanized({chains}) {
        return chains.map(chain => chain.join(' ↠ '));
    },
};

const actions = {
    normalize({commit, getters}) {
        commit('replace', getters.normalized)
    },
    clear({commit}) {
        commit('clear');
    },
    test({state, commit, getters}, {steps, chains}) {
        const states = [];
        const chain = [];
        for (let i = 0; i < state.size; i++) {
            states.push(State.empty());
        }
        for (let i = 0; i < chains; i++) {
            let current = 0;
            let next = -1;
            chain.push([current]);
            states[current].visits++;
            for (let j = 0; j < steps && current !== -1; j++) {
                next = getStep({size: state.size, normalized: getters.normalized}, {from: current});
                if (next !== -1) {
                    chain[i].push(next);
                    states[next].visits++;
                }
                current = next;
            }
        }

        return commit('setBatch', {states, chains: chain});
    },
    async step({state, commit, getters}) {
        const from = state.current;
        let to = getStep({size: state.size, normalized: getters.normalized}, {from});
        if (to === -1) {
            commit('newChain');
            to = getStep({size: state.size, normalized: getters.normalized}, {from});
            if (to === -1) {
                return false;
            }
        }

        return commit('step', {from, to});
    },
};

const mutations = {
    setBatch(state, {states, chains}) {
        state.current = -1;
        state.states = states;
        state.chains = chains;
    },
    newChain(state) {
        state.chains.push([0]);
        state.current = 0;
        state.states[0].visits++;
    },
    step(state, {from, to}) {
        for (let i = 0; i < state.size; i++) {
            if (state.states[i].mode === STATE_PREVIOUS) {
                Vue.set(state.states, i, State.idle(state.states[i]));
            }
        }
        Vue.set(state.states, from, State.from(state.states[from]));
        Vue.set(state.states, to, State.to(state.states[to]));
        state.current = to;
        state.chains[state.chains.length - 1].push(to);

        return {from, to};
    },
    set({matrix}, {x, y, value}) {
        if (Cell.isValid(value)) {
            Vue.set(matrix[x], y, Cell.alter(matrix[x][y], value));
        }
    },
    setTransitionsPlain(state, transitions) {
        const matrix = [];
        for (let i = 0; i < state.size; i++) {
            const row = [];
            for (let j = 0; j < state.size; j++) {
                row.push(0);
            }
            matrix.push(row);
        }
        transitions.split('\n')
            .forEach(chain => {
                const transitions = chain.split(' ').map(vertex => Number.parseInt(vertex));
                for (let i = 0; i < transitions.length - 1; i++) {
                    const from = transitions[i];
                    const to = transitions[i + 1];
                    matrix[from][to]++;
                }
            });
        for (let i = 0; i < state.size; i++) {
            const rowTotal = matrix[i].reduce((sum, value) => sum + value, 0);
            for (let j = 0; j < state.size; j++) {
                matrix[i][j] = Cell.build(rowTotal ? matrix[i][j] / rowTotal : 0);
            }
        }
        Vue.set(state, 'matrix', matrix);
    },
    replace(state, newMatrix) {
        Vue.set(state, 'matrix', newMatrix);
    },
    resize(state, size) {
        size = Math.max(2, parseInt(size));
        if (isNaN(size)) {
            return;
        }
        const oldSize = state.size;
        state.size = size;
        const overlapSize = Math.min(oldSize, state.size);

        const oldMatrix = state.matrix;
        Vue.set(state, 'matrix', []);
        const states = [];
        for (let i = 0; i < state.size; i++) {
            states.push(i < overlapSize ? state.states[i] : State.empty());
            const row = [];
            for (let j = 0; j < state.size; j++) {
                if (i < overlapSize && j < overlapSize) {
                    row.push(Cell.copy(oldMatrix[i][j]));
                } else {
                    row.push(Cell.empty());
                }
            }
            state.matrix.push(row);
        }
        Vue.set(state, 'states', states);
    },
    clear(state) {
        if (state.chains.length > 1 || state.chains[0].length > 1) {
            state.chains = [[0]];
            state.current = 0;
            const states = [State.build(STATE_IDLE, 1, 0)];
            for (let i = 1; i < state.size; i++) {
                states.push(State.empty());
            }
            Vue.set(state, 'states', states);
        } else {
            const matrix = [];
            for (let i = 0; i < state.size; i++) {
                const row = [];
                for (let j = 0; j < state.size; j++) {
                    row.push(Cell.empty());
                }
                matrix.push(row);
            }
            Vue.set(state, 'matrix', matrix);
        }
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    functions: {
        normalize,
    },
}

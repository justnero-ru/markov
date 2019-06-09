import Vue from 'vue'
import Cell from '@/util/Cell'
import State, {STATE_PREVIOUS} from '@/util/State'

const state = {
    size: 2,
    matrix: [[Cell.empty(), Cell.empty()], [Cell.empty(), Cell.empty()]],
    states: [State.empty(), State.empty()],
    current: 0,
    chains: [[0]],
};

const getters = {
    normalized({matrix, size}) {
        const normalized = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            const sum = matrix[i].reduce((sum, cell) => sum + parseInt(cell.value), 0);
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
        const normalized = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            const sum = transitions[i].reduce((sum, cell) => sum + parseInt(cell.value), 0);
            for (let j = 0; j < size; j++) {
                if (sum) {
                    row.push(Cell.normalized(transitions[i][j], sum));
                } else {
                    row.push(Cell.empty());
                }
            }
            normalized.push(row);
        }

        return normalized;
    }
};

const actions = {
    normalize({commit, getters}) {
        commit('replace', getters.normalized)
    },
    clear({commit}) {
        commit('clear');
    },
    async step({state, commit, dispatch}) {
        const from = state.current;
        const to = await dispatch('getStep', {from});

        return commit('step', {from, to});
    },
    async getStep({state, dispatch}, {from}) {
        if (from >= state.size) {
            throw new Error('From can\'t be greater than model size');
        }

        const rnd = Math.random();
        return dispatch('getDestination', {from, rnd});
    },
    getDestination({state, getters}, {from, rnd}) {
        if (from >= state.size) {
            throw new Error('From can\'t be greater than model size');
        }

        let left = rnd;
        for (let to = 0; to < state.size; to++) {
            if (getters.normalized[from][to].value > 0 && getters.normalized[from][to].value >= left) {
                return to;
            }
            left -= getters.normalized[from][to].value;
        }

        return -1;
    },
};

const mutations = {
    newChain(state) {
        state.chains.push([0]);
        state.current = 0;
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
            const states = [];
            for (let i = 0; i < state.size; i++) {
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
}

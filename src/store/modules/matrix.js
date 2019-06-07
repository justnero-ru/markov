import Vue from 'vue'
import Cell from '@/util/Cell'
import State from '@/util/State'

const state = {
    size: 2,
    matrix: [[Cell.empty(), Cell.empty()], [Cell.empty(), Cell.empty()]],
    states: [State.empty(), State.empty()],
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
};

const actions = {
    normalize({commit, getters}) {
        commit('replace', getters.normalized)
    },
    clear({commit}) {
        commit('clear');
    },
};

const mutations = {
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
        for (let i = 0; i < state.size; i++) {
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
    },
    clear({matrix, size}) {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                Vue.set(matrix[i], j, Cell.empty());
            }
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

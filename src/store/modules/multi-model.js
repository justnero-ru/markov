import Cell from '@/util/Cell'
import State from '@/util/State'
import {normalize} from '@/util/Model'

const state = {
    iterations: 0,
    matrices: [],
    states: [],
    chains: [],
};

const getters = {
    statesNormalized({states}) {
        return states.map(states => {
            const sum = states.reduce((sum, state) => sum + state.visits, 0);

            return states.map(state => State.normalized(state, sum));
        });
    },
    transitions({matrices, chains}) {
        return matrices.map((matrix, index) => {
            const chain = chains[index];

            const transitions = [];
            for (let i = 0; i < matrix.length; i++) {
                const row = [];
                for (let j = 0; j < matrix[i].length; j++) {
                    row.push(Cell.alter(matrix[i][j], 0));
                }
                transitions.push(row);
            }
            for (let i = 0; i < chain.length; i++) {
                for (let j = 1; j < chain[i].length; j++) {
                    const x = chain[i][j - 1];
                    const y = chain[i][j];
                    transitions[x][y].value++;
                }
            }

            return transitions;
        });

    },
    transitionsNormalized(state, {transitions}) {
        return transitions.map(transitions => normalize(transitions));
    },
    frequency(state, {transitions}) {
        return transitions.map(transitions => {
            const frequency = [];
            const sum = transitions.reduce((sum, row) => sum + row.reduce((sum, cell) => sum + cell.value, 0), 0);
            for (let i = 0; i < transitions.length; i++) {
                const row = [];
                for (let j = 0; j < transitions.length; j++) {
                    if (sum) {
                        row.push(Cell.normalized(transitions[i][j], sum));
                    } else {
                        row.push(Cell.empty());
                    }
                }
                frequency.push(row);
            }

            return frequency;
        });
    },
    transitionsPlain({chains}) {
        return chains.map(chain => chain.join(' ')).join('\n');
    },
    transitionsHumanized({chains}) {
        return chains.map(chain => chain.join(' ↠ '));
    },
};

const actions = {
    clear({commit}) {
        commit('clear');
    },
};

const mutations = {
    setBatch(state, {cycles}) {
        const states = [];
        const chains = [];
        const matrices = [];
        for (let i = 1; i < cycles.length; i++) {
            states.push(cycles[i].states);
            chains.push(cycles[i].chains);
            matrices.push(cycles[i].matrix);
        }

        state.iterations = cycles.length - 1;
        state.states = states;
        state.chains = chains;
        state.matrices = matrices;
    },
    clear(state) {
        state.iterations = 0;
        state.states = [];
        state.chains = [];
        state.matrices = [];
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

import Cell from "../../classes/Cell";
import {cloneDeep} from "lodash";

const state = {
    size: 1,
    matrix: [[new Cell()]],
    steps: 10,
    chains: 5,
};

const getters = {
    normalized(state) {
        const normalized = cloneDeep(state.matrix),
            size = normalized.length;
        for (let i = 0; i < size; i++) {
            const sum = normalized[i].reduce((sum, cell) => sum + parseFloat(cell.value), 0);
            if (sum) {
                for (let j = 0; j < size; j++) {
                    normalized[i][j].value = (normalized[i][j].value / sum).toFixed(3);
                }
            }
        }
        return normalized;
    },
    asText(state) {
        let text = `N = ${state.size}\r\n\r\n`;
        for (let i = 0; i < state.size; i++) {
            for (let j = 0; j < state.size; j++) {
                if (j > 0) {
                    text += ' ';
                }
                text += parseFloat(state.matrix[i][j].value).toFixed(3);
            }
            text += "\r\n";
        }
        return text;
    },
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
    set(state, {x, y, value, mode}) {
        const sanitized = parseFloat(value);
        if (!isNaN(sanitized)) {
            if (x < state.size && y < state.size) {
                state.matrix[x][y][mode === 'data' ? 'value' : 'eps'] = sanitized;
            }
        }
    },
    setChains(state, value) {
        state.chains = value;
    },
    setSteps(state, value) {
        state.steps = value;
    },
    replace(state, matrix) {
        state.matrix = cloneDeep(matrix);
    },
    clear(state) {
        for (let i = 0; i < state.size; i++) {
            for (let j = 0; j < state.size; j++) {
                state.matrix[i][j] = new Cell();
            }
        }
    },
    resize(state, size) {
        const oldSize = state.size;
        state.size = parseInt(size);

        let newMatrix = state.matrix;
        if (state.size > oldSize) {
            for (let i = 0; i < oldSize; i++) {
                for (let j = oldSize; j < state.size; j++) {
                    newMatrix[i].push(new Cell());
                }
            }
            for (let i = oldSize; i < state.size; i++) {
                let row = [];
                for (let j = 0; j < state.size; j++) {
                    row.push(new Cell());
                }
                newMatrix.push(row);
            }
        } else if (state.size < oldSize) {
            for (let i = 0; i < state.size; i++) {
                newMatrix[i] = newMatrix[i].slice(0, state.size);
            }
            newMatrix = newMatrix.slice(0, state.size);
        }
        state.matrix = newMatrix;
    },
    loadFromText(state, str) {
        const lines = str
            .split("\n")
            .map(line => line.trim());

        const N = parseInt(lines[0].split('=').map(part => part.trim())[1]);

        if (N > 0) {
            const matrix = lines.slice(1)
                .filter(line => line.trim().length > 0)
                .map(line =>
                    line.split(' ')
                        .map(element =>
                            parseFloat(element.trim())
                        )
                );

            state.size = N;

            let newMatrix = [];
            for (let line of matrix) {
                let row = [];
                for (let element of line) {
                    row.push(new Cell(element));
                }
                newMatrix.push(row);
            }
            state.matrix = newMatrix;
            return true;
        }

        return false;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}

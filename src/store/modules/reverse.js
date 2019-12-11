import model from '@/store/modules/model'
import {utils, writeFile} from 'xlsx';

const state = {
    steps: 10,
    chains: 5,
    transitionsPlain: '',
};

const getters = {
    sourceTable({model, chains, steps}) {
        const table = [];
        const header = [''];
        for (let i = 0; i < model.size; i++) {
            header.push(`S${i}`);
        }
        table.push(['Размерность', model.size]);
        table.push(['Цепочки', chains]);
        table.push(['Шаги', steps]);
        table.push([]);

        table.push(['Исходная матрица']);
        table.push(header);
        for (let i = 0; i < model.size; i++) {
            const row = [`S${i}`];
            for (let j = 0; j < model.size; j++) {
                row.push(model.matrix[i][j].value);
            }
            table.push(row);
        }
        table.push([]);

        return table;
    },
    resultTable({model}, getters) {
        const table = [];
        let row;

        const header = [''];
        for (let i = 0; i < model.size; i++) {
            header.push(`S${i}`);
        }

        const rows = [
            ['Переходов'],
            ['Время (общее)'],
            ['Время (среднее)'],
        ];
        for (let i = 0; i < model.size; i++) {
            const s = model.states[i];
            rows[0].push(s.visits);
            rows[1].push(s.time);
            rows[2].push(s.visits > 0 ? s.time / s.visits : 0);
        }
        table.push(header);
        rows.forEach(row => table.push(row));
        table.push([]);

        table.push(['Матрица количества переходов']);
        table.push(header);
        for (let i = 0; i < model.size; i++) {
            row = [`S${i}`];
            for (let j = 0; j < model.size; j++) {
                row.push(getters['model/transitions'][i][j].value);
            }
            table.push(row);
        }
        table.push([]);

        table.push(['Матрица вероятности переходов']);
        table.push(header);
        for (let i = 0; i < model.size; i++) {
            row = [`S${i}`];
            for (let j = 0; j < model.size; j++) {
                row.push(getters['model/transitionsNormalized'][i][j].value);
            }
            table.push(row);
        }
        table.push([]);

        table.push(['Матрица частот переходов']);
        table.push(header);
        for (let i = 0; i < model.size; i++) {
            row = [`S${i}`];
            for (let j = 0; j < model.size; j++) {
                row.push(getters['model/frequency'][i][j].value);
            }
            table.push(row);
        }
        table.push([]);

        return table;
    },
    chainsTable({model}) {
        const table = [];
        table.push(['Цепочки']);
        model.chains.forEach(chain => table.push(chain));

        return table;
    },
};

const actions = {
    save({getters}) {
        const wb = utils.book_new();

        utils.book_append_sheet(wb, utils.aoa_to_sheet(getters.sourceTable), 'Исходная модель');
        utils.book_append_sheet(wb, utils.aoa_to_sheet(getters.resultTable), 'Результаты');
        utils.book_append_sheet(wb, utils.aoa_to_sheet(getters.chainsTable), 'Цепочки');
        writeFile(wb, 'model.xlsx');
    },
    test({state, dispatch}) {
        return dispatch('model/test', {
            chains: state.chains,
            steps: state.steps,
        });
    },
    normalize({commit, getters}) {
        commit('replace', getters.normalized)
    },
    clear({commit}) {
        commit('clear');
    },
};

const mutations = {
    setChains(state, value) {
        state.chains = value;
    },
    setSteps(state, value) {
        state.steps = value;
    },
    setTransitionsPlain(state, value) {
        state.transitionsPlain = value;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        model,
    }
}

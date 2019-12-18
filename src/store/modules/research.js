import model from '@/store/modules/model'
import multiModel from '@/store/modules/multi-model'
import {utils, writeFile} from 'xlsx';
import {directRound, reverseRound} from "@/util/Model";

const state = {
    steps: 10,
    chains: 5,
    iterations: 10,
    eps: 0,
    distribution: 'uniform',
    distributionA: 0,
    distributionB: 1,
};

const getters = {
    sourceTable({model, chains, steps, iterations, eps, distribution, distributionA, distributionB}) {
        const table = [];
        const header = [''];
        for (let i = 0; i < model.size; i++) {
            header.push(`S${i}`);
        }
        table.push(['Размерность', model.size]);
        table.push(['Цепочки', chains]);
        table.push(['Шаги', steps]);
        table.push(['Итерации', iterations]);
        table.push(['ε', eps]);
        table.push(['Распределение', distribution, distributionA, distributionB]);
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
    statesByIterationTable({model, iterations}, getters) {
        const table = [];
        let row;
        const merges = [
            {s: {r: 0, c: 0}, e: {r: 1, c: 0}},
        ];

        const header = ['Итерация'];
        const subHeader = [''];
        for (let i = 0; i < model.size; i++) {
            header.push(`S${i}`, '');
            subHeader.push('Частота', 'Время');
            merges.push({s: {r: 0, c: 1 + i * 2}, e: {r: 0, c: 2 + i * 2}});
        }
        table.push(header, subHeader);

        row = ['Исходная модель'];
        getters['model/statesNormalized'].forEach(state => row.push(state.visits, state.time));
        table.push(row);

        getters['multiModel/statesNormalized'].forEach((states, iteration) => {
            row = [iteration === iterations - 1 ? 'Итоговая модель' : iteration + 1];
            states.forEach(state => row.push(state.visits, state.time));
            table.push(row);
        });

        const sheet = utils.aoa_to_sheet(table);

        sheet['!merges'] = merges;

        return sheet;
    },
    transitionsByIterationTable({model, iterations}, getters) {
        const table = [];
        let row;
        const merges = [
            {s: {r: 0, c: 0}, e: {r: 1, c: 0}},
        ];

        const transitions = [];
        const header = ['Итерация'];
        const subHeader = [''];
        for (let x = 0; x < model.size; x++) {
            for (let y = 0; y < model.size; y++) {
                if (model.matrix[x][y].value !== 0) {
                    transitions.push({x, y});
                    const i = transitions.length - 1;
                    header.push(`S${x} ↠ S${y}`, '');
                    subHeader.push('Частота', 'Количество переходов');
                    merges.push({s: {r: 0, c: 1 + i * 2}, e: {r: 0, c: 2 + i * 2}});
                }
            }
        }
        table.push(header, subHeader);

        row = ['Исходная модель'];
        for (let i = 0; i < transitions.length; i++) {
            const {x, y} = transitions[i];
            row.push(
                getters['model/frequency'][x][y].value,
                getters['model/transitions'][x][y].value,
            );
        }
        table.push(row);

        for (let iteration = 0; iteration < iterations; iteration++) {
            row = [iteration === iterations - 1 ? 'Итоговая модель' : iteration + 1];
            for (let i = 0; i < transitions.length; i++) {
                const {x, y} = transitions[i];
                row.push(
                    getters['multiModel/frequency'][iteration][x][y].value,
                    getters['multiModel/transitions'][iteration][x][y].value,
                );
            }
            table.push(row);
        }

        const sheet = utils.aoa_to_sheet(table);

        sheet['!merges'] = merges;

        return sheet;
    },
    resultTable({chains, model}, getters) {
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
            rows[0].push(s.visits - (i === 0 ? chains : 0));
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
        utils.book_append_sheet(wb, getters.statesByIterationTable, 'Состояния по итерациям');
        utils.book_append_sheet(wb, getters.transitionsByIterationTable, 'Переходы по итерациям');
        utils.book_append_sheet(wb, utils.aoa_to_sheet(getters.resultTable), 'Результаты');
        writeFile(wb, 'model.xlsx');
    },
    test({state, getters, commit}) {
        const cycles = [];
        const distribution = {
            type: state.distribution,
            attrs: [state.distributionA, state.distributionB],
        };

        cycles.push(directRound({
            size: state.model.size,
            chains: state.chains,
            steps: state.chains,
            matrix: getters['model/normalized'],
            distribution,
        }));

        for (let i = 1; i <= state.iterations; i++) {
            cycles.push(directRound({
                size: state.model.size,
                chains: state.chains,
                steps: state.chains,
                matrix: reverseRound({
                    size: state.model.size,
                    chains: cycles[i - 1].chains,
                }),
                distribution,
            }))
        }

        commit('model/setBatch', {states: cycles[0].states, chains: cycles[0].chains});
        commit('multiModel/setBatch', {cycles});
    },
    normalize({commit, getters}) {
        commit('replace', getters.normalized)
    },
    clear({state, commit}) {
        commit(`${state.multiModel.iterations > 0 ? 'multiModel' : 'model'}/clear`);
    },
};

const mutations = {
    setChains(state, value) {
        state.chains = Number(value);
    },
    setSteps(state, value) {
        state.steps = Number(value);
    },
    setIterations(state, value) {
        state.iterations = Number(value);
    },
    setEps(state, value) {
        state.eps = Number(value);
    },
    setDistribution(state, value) {
        state.distribution = value;
    },
    setDistributionA(state, value) {
        state.distributionA = Number(value);
    },
    setDistributionB(state, value) {
        state.distributionB = Number(value);
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
        multiModel,
    }
}

<template>
    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Восстановление Марковской модели</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <button class="btn btn-sm btn-outline-primary" @click="test">Тестировать</button>
                    <button class="btn btn-sm btn-outline-secondary" @click="normalize">Нормализовать</button>
                    <button class="btn btn-sm btn-outline-secondary" @click="modalSaveOpen">Сохранить</button>
                    <button class="btn btn-sm btn-outline-secondary" @click="modalLoadOpen">Загрузить</button>
                    <button class="btn btn-sm btn-outline-secondary" @click="matrixClear">Очистить</button>
                </div>
            </div>
        </div>

        <h2>Настройки</h2>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="model-size">Размерность модели</label>
                    <input type="number" id="model-size" class="form-control" min="2" step="1"
                           v-model="modelSize">
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="step-count">Максимальное количество шагов</label>
                    <input type="number" id="step-count" class="form-control" min="1" step="1"
                           v-model="stepCount">
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="run-count">Количество цепочек</label>
                    <input type="number" id="run-count" class="form-control" min="1" step="1"
                           v-model="runCount">
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="eps">Точность 𝜀</label>
                    <input type="number" id="eps" class="form-control" v-model="eps">
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="iteration-count">Количество итераций</label>
                    <input type="number" id="iteration-count" class="form-control" v-model="iterationCount" min="1"
                           step="1">
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2">
            <h2>Исходная модель</h2>
        </div>

        <div class="d-flex justify-content-between flex-wrap align-items-start">
            <matrix :model-size="modelSize" :matrix="directMatrix" @matrix-change="matrixChange"
                    :eps="epsForMatrix"></matrix>
            <div class="markov__model flex-shrink-0" v-html="modelFirst"></div>
        </div>

        <div v-if="!isTested" class="d-flex justify-content-center flex-wrap flex-md-nowrap align-items-center">
            Проведите тестирование что бы восстановить модель
        </div>

        <div class="d-flex justify-content-end flex-wrap flex-md-nowrap align-items-center">
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <button class="btn btn-sm btn-outline-primary" @click="intermediateShowed = !intermediateShowed">
                        {{ intermediateShowed ? 'Скрыть промежуточные модели' : 'Показать промежуточные модели' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-for="(matrix, index) in recoveredMatrices">
            <template v-if="intermediateShowed || index + 1 === recoveredMatrices.length">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-1 mt-2">
                    <h2 v-if="index + 1 < recoveredMatrices.length">Промежуточная модель {{ index + 1 }} порядка</h2>
                    <h2 v-else>Восстановленная модель <small>(σ = {{ stdev }})</small></h2>
                </div>

                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center p-0 mt-0 mb-1">
                    <h5>Цепочки, используемые для восстановления</h5>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group mr-2">
                            <button class="btn btn-sm btn-outline-primary" @click="chainsShowed = !chainsShowed">
                                {{ chainsShowed ? 'Скрыть' : 'Показать' }}
                            </button>
                        </div>
                    </div>
                </div>
                <transition name="dropdown">
                    <div class="d-flex justify-content-start flex-wrap mb-1"
                         v-if="chainsShowed">
                        <div v-for="chain in chains[index]">
                            <div v-if="chain.length > 0"
                                 class="markov__chain d-flex justify-content-start flex-wrap pt-2 pb-2 mr-5">
                                <span>{{ chain[0].from }}</span>
                                <span v-for="transition in chain">{{ transition.to }}</span>
                            </div>
                        </div>
                    </div>
                </transition>

                <div class="d-flex justify-content-between flex-wrap align-items-start">
                    <matrix :model-size="modelSize" :matrix="matrix"
                            :compare-to="directMatrix" :change="false"
                            :eps="epsForMatrix"></matrix>
                    <div class="markov__model flex-shrink-0"
                         v-html="recoveredModels && recoveredModels.length > index ? recoveredModels[index] : ''"></div>
                </div>
            </template>
        </div>

        <modal v-if="modalShown" :buttons="modalButtons" @close="modalClose($event)">
            <h3 slot="header" class="text-primary">{{ modalType === 'load' ? 'Загрузить' : 'Сохранить' }}</h3>
            <div class="form-group" slot="body" v-if="modalType === 'load'">
                <input type="file" @change="modalClose">
            </div>
        </modal>
    </main>
</template>

<script>
    import Cell from "../classes/Cell";
    import DataMatrix from "./DataMatrix";
    import Modal from "./Modal";
    import {configFromMatrix, renderSvg} from "../modules/drawer";
    import {createNamespacedHelpers} from "vuex";

    const {mapActions, mapGetters, mapState} = createNamespacedHelpers('double');

    export default {
        name: 'DoubleMode',
        components: {
            matrix: DataMatrix,
            modal: Modal,
        },
        data() {
            return {
                chainsShowed: false,
                intermediateShowed: false,
                modalShown: false,
                modalType: '',
                modalButtons: [],
            }
        },
        computed: {
            ...mapState({
                isTested: state => state.multi.isGenerated,
                directMatrix: state => state.direct.model.matrix,
                recoveredMatrices: state => state.multi.intensities,
                chains: state => state.multi.transitions,
            }),
            ...mapGetters({
                directModelConfig: 'direct/config',
                recoveredModelConfigs: 'multi/configs',
                stdev: 'stdev',
            }),
            eps: {
                get() {
                    return this.$store.state.double.eps;
                },
                set(value) {
                    this.$store.commit('double/setEps', value);
                },
            },
            iterationCount: {
                get() {
                    return this.$store.state.double.multi.iterationCount;
                },
                set(value) {
                    this.$store.commit('double/multi/setIterationCount', value);
                },
            },
            modelSize: {
                get() {
                    return this.$store.state.double.direct.model.size;
                },
                set(value) {
                    this.$store.commit('double/direct/model/resize', value);
                    this.$store.dispatch('double/resetReverse');
                },
            },
            runCount: {
                get() {
                    return this.$store.state.double.direct.model.chains;
                },
                set(value) {
                    this.$store.commit('double/direct/model/setChains', value);
                },
            },
            stepCount: {
                get() {
                    return this.$store.state.double.direct.model.steps;
                },
                set(value) {
                    this.$store.commit('double/direct/model/setSteps', value);
                },
            },
            epsForMatrix() {
                if (isNaN(parseFloat(this.eps)) || parseFloat(this.eps) === 0) {
                    return true;
                }
                return parseFloat(this.eps);
            },
        },
        asyncComputed: {
            modelFirst() {
                const config = configFromMatrix({...this.directModelConfig, mode: 'intensity'});
                return renderSvg(config);
            },
            recoveredModels() {
                const renders = [];
                for (let i = 0; i < this.recoveredModelConfigs.length; i++) {
                    const config = configFromMatrix({...this.recoveredModelConfigs[i], mode: 'entryCount'});
                    renders.push(renderSvg(config));
                }
                return Promise.all(renders);
            }
        },
        methods: {
            ...mapActions({
                normalize: 'direct/model/normalize',
                matrixClear: 'clear',
                matrixChange: 'direct/matrixChange',
                test: 'test',
            }),
            modalSaveOpen() {
                this.modalShown = true;
                this.modalType = 'save';
                this.modalButtons = [
                    {
                        value: 'input-matrix',
                        label: 'Первичная матрица вероятностей',
                    },
                    {
                        value: 'input-model',
                        label: 'Первичная модель',
                    },
                    {
                        value: 'chains',
                        label: 'Цепочки',
                    },
                    {
                        value: 'output-matrix',
                        label: 'Вторичная матрица вероятностей',
                    },
                    {
                        value: 'output-model',
                        label: 'Вторичная модель',
                    },
                ];
            },
            modalLoadOpen() {
                this.modalShown = true;
                this.modalType = 'load';
                this.modalButtons = [];
            },
            modalClose(mode) {
                this.modalShown = false;
                switch (this.modalType) {
                    case 'save':
                        return this.onModalSave(mode);
                    case 'load':
                        return this.onModalLoad(mode);
                }
            },
            onModalSave(mode) {
                let text = '';
                switch (mode) {
                    case 'input-matrix':
                        text += `N = ${this.modelSize}\n\n`;
                        for (let i = 0; i < this.modelSize; i++) {
                            for (let j = 0; j < this.modelSize; j++) {
                                if (j > 0) {
                                    text += ' ';
                                }
                                text += parseFloat(this.matrix[i][j].value).toFixed(3);
                            }
                            text += "\n";
                        }
                        saveAs(new Blob([text], {type: "text/plain;charset=utf-8"}), 'markov-input-matrix.txt');
                        break;
                    case 'input-model':
                        saveAs(new Blob([this.modelFirst], {type: "text/plain;charset=utf-8"}), 'markov-input-model.svg');
                        break;
                    case 'chains':
                        if (this.chains === false) {
                            break;
                        }
                        text += `N = ${this.modelSize}\n\n`;
                        for (let k = 0; k < this.chains.length; k++) {
                            let chain = this.chains[k];
                            text += chain[0].from;
                            for (let i = 0; i < chain.length; i++) {
                                text += ` ${chain[i].to}`;
                            }
                            text += "\n";
                        }
                        saveAs(new Blob([text], {type: "text/plain;charset=utf-8"}), 'markov-chain.txt');
                        break;
                    case 'output-matrix':
                        text += `N = ${this.modelSize}\n\n`;
                        for (let i = 0; i < this.modelSize; i++) {
                            for (let j = 0; j < this.modelSize; j++) {
                                if (j > 0) {
                                    text += ' ';
                                }
                                text += parseFloat(this.matrixSecond[i][j].value).toFixed(3);
                            }
                            text += "\n";
                        }
                        saveAs(new Blob([text], {type: "text/plain;charset=utf-8"}), 'markov-output-matrix.txt');
                        break;
                    case 'output-model':
                        saveAs(new Blob([this.modelSecond], {type: "text/plain;charset=utf-8"}), 'markov-input-model.svg');
                        break;
                }
            },
            onModalLoad(e) {
                if (!e) {
                    return false;
                }
                for (let file of e.target.files) {
                    if (file.type !== 'text/plain') {
                        continue;
                    }
                    const reader = new FileReader();
                    reader.onload = event => {
                        const lines = event.target.result
                            .split("\n")
                            .map(line => line.trim());

                        let [_, N] = lines[0].split('=').map(part => part.trim());

                        if (N > 0) {
                            const matrix = lines.slice(1)
                                .filter(line => line.trim().length > 0)
                                .map(line =>
                                    line.split(' ')
                                        .map(element =>
                                            parseFloat(element.trim())
                                        )
                                );

                            this.matrixClear();
                            this.matrixClear();
                            this.modelSize = N;

                            let newMatrix = [];
                            for (let line of matrix) {
                                let row = [];
                                for (let element of line) {
                                    row.push(new Cell(element));
                                }
                                newMatrix.push(row);
                            }
                            this.matrix = newMatrix;
                        } else {
                            alert('Формат файла не поддерживается');
                        }
                    };
                    reader.readAsText(file);

                    return true;
                }
                alert('Формат файла не поддерживается');
            },
        },
    }
</script>

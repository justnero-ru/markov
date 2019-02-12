<template>
    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Двухсторонняя Марковская цепь</h1>
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
            <div class="col-4">
                <div class="form-group">
                    <label for="model-size">Размерность модели</label>
                    <input type="number" id="model-size" class="form-control" min="2" step="1"
                           v-model="modelSize">
                </div>
            </div>
            <div class="col-4">
                <div class="form-group">
                    <label for="step-count">Максимальное количество шагов</label>
                    <input type="number" id="step-count" class="form-control" min="1" step="1"
                           v-model="stepCount">
                </div>
            </div>
            <div class="col-4">
                <div class="form-group">
                    <label for="iteration-count">Количество цепочек</label>
                    <input type="number" id="iteration-count" class="form-control" min="1" step="1"
                           v-model="runCount">
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2">
            <h2>Первичная модель</h2>
        </div>

        <div class="d-flex justify-content-between flex-wrap align-items-start">
            <matrix :model-size="modelSize" :matrix="matrix" @matrix-change="matrixChange"></matrix>
            <div class="markov__model flex-shrink-0" v-html="modelFirst"></div>
        </div>

        <div v-if="chains.length">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mt-4 mb-3 border-bottom">
                <h4>Используемые цепочки для генерации обратной модели</h4>
                <div class="btn-toolbar mb-2 mb-md-0">
                    <div class="btn-group mr-2">
                        <button class="btn btn-sm btn-outline-primary" @click="chainsShowed = !chainsShowed">
                            {{ chainsShowed ? 'Скрыть' : 'Показать' }}
                        </button>
                    </div>
                </div>
            </div>
            <transition name="dropdown">
                <div class="d-flex justify-content-start flex-wrap"
                     v-if="chainsShowed">
                    <div v-for="chain in chains">
                        <div v-if="chain.length > 0"
                             class="markov__chain d-flex justify-content-start flex-wrap pt-2 pb-2 mr-5">
                            <span>{{ chain[0].from}}</span>
                            <span v-for="transition in chain">{{ transition.to }}</span>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
        <div v-else class="d-flex justify-content-center flex-wrap flex-md-nowrap align-items-center">
            Проведите тестирование что бы построить цепочки на вход второго этапа
        </div>

        <div v-if="chains.length > 0">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2">
                <h2>Вторичная модель</h2>
            </div>

            <div class="d-flex justify-content-between flex-wrap align-items-start">
                <matrix :model-size="modelSize" :matrix="matrixSecond" :compare-to="matrix" :change="false"></matrix>
                <div class="markov__model flex-shrink-0" v-html="modelSecond"></div>
            </div>
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
    import DirectMarkovChain from "../classes/DirectMarkovChain";
    import ReverseMarkovChain from "../classes/ReverseMarkovChain";
    import Cell from "../classes/Cell";
    import Transition from "../classes/Transition";
    import DataMatrix from "./DataMatrix";
    import Modal from "./Modal";
    import {configFromMatrix, renderSvg} from "../modules/drawer";

    export default {
        name: 'DoubleMode',
        data() {
            return {
                modelSize: 4,
                matrix: [],
                matrixSecond: [],
                direct: false,
                runCount: 5,
                stepCount: 10,
                chains: false,
                modalShown: false,
                modalType: '',
                modalButtons: [],
                chainsShowed: false,
            }
        },
        components: {
            matrix: DataMatrix,
            modal: Modal,
        },
        asyncComputed: {
            modelFirst() {
                let config = configFromMatrix(this.matrix, [], [], new Transition(-1, -1), 'intensity');
                return renderSvg(config);
            },
            modelSecond() {
                let config = configFromMatrix(this.matrixSecond, [], [], new Transition(-1, -1), 'intensity');
                return renderSvg(config);
            }
        },
        created() {
            let matrix = [];
            for (let i = 0; i < this.modelSize; i++) {
                let row = [];
                for (let j = 0; j < this.modelSize; j++) {
                    row.push(new Cell());
                }
                matrix.push(row);
            }
            this.matrix = matrix;
            this.$watch('modelSize', this.matrixResize);
        },
        methods: {
            init() {
                if (!this.direct) {
                    this.direct = new DirectMarkovChain(JSON.parse(JSON.stringify(this.matrix)));
                }
            },
            test() {
                const direct = new DirectMarkovChain(JSON.parse(JSON.stringify(this.matrix)));
                let testResults = direct.test(this.runCount, this.stepCount),
                    chains = [];
                for (let k = 0; k < testResults.length; k++) {
                    chains.push(testResults[k].chain);
                }
                this.chains = chains;
                this.generateSecondStep();
            },
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
            generateSecondStep() {
                let reverse = new ReverseMarkovChain(this.modelSize, this.chains.flat());
                this.matrixSecond = reverse.intensivityMatrix;
            },
            matrixResize(newSize) {
                let newMatrix = this.matrix;
                const oldSize = this.matrix.length;
                if (newSize > oldSize) {
                    for (let i = 0; i < oldSize; i++) {
                        for (let j = oldSize; j < newSize; j++) {
                            newMatrix[i].push(new Cell());
                        }
                    }
                    for (let i = oldSize; i < newSize; i++) {
                        let row = [];
                        for (let j = 0; j < newSize; j++) {
                            row.push(new Cell());
                        }
                        newMatrix.push(row);
                    }
                } else if (newSize < oldSize) {
                    for (let i = 0; i < newSize; i++) {
                        newMatrix[i] = newMatrix[i].slice(0, newSize);
                    }
                    newMatrix = newMatrix.slice(0, newSize);
                }
                this.matrix = newMatrix;
                this.chains = [];
            },
            matrixChange(i, j, value) {
                this.matrix[i][j].value = value;
                this.direct = new DirectMarkovChain(JSON.parse(JSON.stringify(this.matrix)));
                this.chains = [];
            },
            normalize() {
                let normalized = DirectMarkovChain.normalize(JSON.parse(JSON.stringify(this.matrix)));
                for (let i = 0; i < this.modelSize; i++) {
                    for (let j = 0; j < this.modelSize; j++) {
                        this.matrix[i][j].value = normalized[i][j].value;
                    }
                }
            },
            matrixClear() {
                if (this.chains.length) {
                    this.chains = [];
                } else {
                    for (let i = 0; i < this.modelSize; i++) {
                        for (let j = 0; j < this.modelSize; j++) {
                            this.matrix[i][j].clear();
                        }
                    }
                    this.direct && this.direct.reset();
                }
            }
        }
    }
</script>

<style scoped>

</style>

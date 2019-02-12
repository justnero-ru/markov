<template>
    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Обратная Марковская цепь</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <button class="btn btn-sm btn-outline-primary" @click="test">Тестировать</button>
                    <button class="btn btn-sm btn-outline-primary" :disabled="testResults !== false"
                            @click="step">
                        Шаг
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" @click="modalSaveOpen">Сохранить</button>
                    <button class="btn btn-sm btn-outline-secondary" @click="modalLoadOpen">Загрузить</button>
                    <button class="btn btn-sm btn-outline-secondary" @click="clear">Очистить</button>
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
        <div class="row">
            <div class="col-12">
                <div class="form-group">
                    <label for="model">Модель</label>
                    <textarea id="model" class="form-control w-100" rows="3" v-model="model"></textarea>
                </div>
            </div>
        </div>
        <matrix :model-size="modelSize" :matrix="matrix" :change="false"></matrix>

        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2">
            <h2>Модель</h2>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <button class="btn btn-sm btn-outline-primary" :disabled="testResults !== false"
                            @click="step">
                        Шаг
                    </button>
                    <button :class="['btn', 'btn-sm', 'btn-outline-secondary', {'active': display === 'intensity'}]"
                            @click="display='intensity'">
                        Вероятность
                    </button>
                    <button :class="['btn', 'btn-sm', 'btn-outline-secondary', {'active': display === 'frequencyTransition'}]"
                            @click="display='frequencyTransition'">
                        Частота перехода
                    </button>
                    <button :class="['btn', 'btn-sm', 'btn-outline-secondary', {'active': display === 'frequencyState'}]"
                            @click="display='frequencyState'">
                        Частота состояний
                    </button>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2">
            <div class="markov__chain d-flex justify-content-start flex-wrap pt-2 pb-2">
                <span v-for="state in chain">{{ state }}</span>
            </div>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <button :class="['btn', 'btn-sm', {'btn-outline-secondary': !copied, 'btn-outline-success': copied}]"
                            @click="copyChain"><i class="fa fa-copy"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="markov__model" v-html="modelRender"></div>

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
    import Transition from "../classes/Transition";
    import TestResult from "../classes/TestResult";
    import ReverseMarkovChain from "../classes/ReverseMarkovChain";
    import DataMatrix from "./DataMatrix";
    import Modal from "./Modal";
    import {configFromMatrix, renderSvg} from "../modules/drawer";
    import copy from 'clipboard-copy';
    import saveAs from 'file-saver';

    export default {
        name: 'ReverseMode',
        data() {
            return {
                modelSize: 4,
                model: '',
                matrix: [],
                stepCount: 100,
                runCount: 10,
                reverse: false,
                display: 'intensity',
                deadEnds: [],
                testResults: false,
                transition: false,
                chainEnd: false,
                chain: [0],
                copied: false,
                modalShown: false,
                modalType: '',
                modalButtons: [],
            };
        },
        components: {
            matrix: DataMatrix,
            modal: Modal,
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
            this.$watch('modelSize', this.modelRebuild);
            this.$watch('modelTransitions', this.modelRebuild);
        },
        computed: {
            modelTransitions() {
                let transitions = [],
                    stateList = this.model
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
            }
        },
        methods: {
            init() {
                if (!this.reverse) {
                    this.reverse = new ReverseMarkovChain(this.modelSize, this.modelTransitions);
                }
            },
            modalSaveOpen() {
                this.modalShown = true;
                this.modalType = 'save';
                this.modalButtons = [
                    {
                        value: 'matrix',
                        label: 'Матрицу вероятностей',
                    },
                    {
                        value: 'model',
                        label: 'Модель',
                    },
                    {
                        value: 'chains',
                        label: 'Цепочки',
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
                    case 'matrix':
                        text += `N = ${this.modelSize}\r\n\r\n`;
                        for (let i = 0; i < this.modelSize; i++) {
                            for (let j = 0; j < this.modelSize; j++) {
                                if (j > 0) {
                                    text += ' ';
                                }
                                text += parseFloat(this.matrix[i][j].value).toFixed(3);
                            }
                            text += "\n";
                        }
                        saveAs(new Blob([text], {type: "text/plain;charset=utf-8"}), 'markov-matrix.txt');
                        break;
                    case 'model':
                        saveAs(new Blob([this.modelRender], {type: "text/plain;charset=utf-8"}), 'markov-model.svg');
                        break;
                    case 'chains':
                        text += `N = ${this.modelSize}\r\n\r\n`;
                        text += this.model;
                        saveAs(new Blob([text], {type: "text/plain;charset=utf-8"}), 'markov-chain.txt');
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
                            const model = lines.slice(1)
                                .filter(line => line.trim().length > 0)
                                .join("\n");

                            this.clear();
                            this.clear();
                            this.modelSize = N;
                            this.model = model;
                        } else {
                            alert('Формат файла не поддерживается');
                        }
                    };
                    reader.readAsText(file);

                    return true;
                }
                alert('Формат файла не поддерживается');
            },
            copyChain() {
                copy(this.chain.join(' '))
                    .then(() => {
                        this.copied = true;
                        setTimeout(() => this.copied = false, 750);
                    });
            },
            modelRebuild() {
                this.reverse = new ReverseMarkovChain(this.modelSize, this.modelTransitions);
                this.matrix = this.reverse.intensivityMatrix;
            },
            step() {
                this.init();
                this.transition = this.reverse.next();
                if (this.transition.to === null) {
                    this.transition = false;
                    this.chainEnd = true;
                    this.reverse.reset();
                } else {
                    if (this.chainEnd) {
                        this.chain = [this.transition.from];
                        this.chainEnd = false;
                    }
                    this.chain.push(this.transition.to);
                }
            },
            test() {
                this.transition = false;
                this.deadEnds = [];
                this.testResults = false;

                const reverse = new ReverseMarkovChain(this.modelSize, this.modelTransitions);
                let testResults = reverse.test(this.runCount, this.stepCount);
                let transitions = new Array(this.modelSize),
                    stateVisits = new Array(this.modelSize),
                    deadEnds = [];
                for (let i = 0; i < this.modelSize; i++) {
                    stateVisits[i] = 0;
                    transitions[i] = new Array(this.modelSize);
                    for (let j = 0; j < this.modelSize; j++) {
                        transitions[i][j] = new Cell();
                    }
                }
                for (let k = 0; k < testResults.length; k++) {
                    if (testResults[k].stepCount < this.stepCount) {
                        deadEnds.push(testResults[k].lastPosition);
                    }
                    for (let i = 0; i < this.modelSize; i++) {
                        stateVisits[i] += testResults[k].stateVisits[i];
                        for (let j = 0; j < this.modelSize; j++) {
                            transitions[i][j].value += testResults[k].transitions[i][j].value;
                        }
                    }
                }
                this.deadEnds = deadEnds;
                this.testResults = new TestResult(transitions, false, this.stepCount, stateVisits);
            },
            clear() {
                if (this.testResults !== false) {
                    this.testResults = false;
                } else {
                    this.model = '';
                    this.deadEnds = [];
                }
            },
        },
        asyncComputed: {
            modelRender() {
                let config;
                if (!this.testResults) {
                    config = configFromMatrix(this.matrix, this.reverse.stateVisits, this.reverse.transitionMatrix, this.transition, this.display, this.deadEnds);
                } else {
                    config = configFromMatrix(this.matrix, this.testResults.stateVisits, this.testResults.transitions, new Transition(-1, -1), this.display, this.deadEnds);
                }
                return renderSvg(config);
            }
        },
    }
</script>

<style scoped>

</style>

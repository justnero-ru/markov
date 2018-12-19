<template>
    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Прямая Марковская цепь</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <button class="btn btn-sm btn-outline-secondary" @click="test">Тестировать</button>
                    <button class="btn btn-sm btn-outline-secondary" :disabled="testResults !== false"
                            @click="step">Шаг
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" :disabled="testResults !== false"
                            @click="normalize">Нормализовать
                    </button>
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
        <matrix :model-size="modelSize" :matrix="matrix" @matrix-change="matrixChange"></matrix>

        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2">
            <h2>Модель</h2>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <button :class="['btn', 'btn-sm', 'btn-outline-secondary', {'active': display === 'intensity'}]"
                            @click="display='intensity'">Интенсивность
                    </button>
                    <button :class="['btn', 'btn-sm', 'btn-outline-secondary', {'active': display === 'frequencyTransition'}]"
                            @click="display='frequencyTransition'">Частота
                        перехода
                    </button>
                    <button :class="['btn', 'btn-sm', 'btn-outline-secondary', {'active': display === 'frequencyState'}]"
                            @click="display='frequencyState'">Частота
                        состояний
                    </button>
                </div>
            </div>
        </div>

        <h4 class="mt-4 mb-0">Текущая цепочка</h4>
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-1 pb-3">
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
        <div class="markov__model" v-html="model"></div>
    </main>
</template>

<script>
    import DirectMarkovChain from "../classes/DirectMarkovChain";
    import Cell from "../classes/Cell";
    import TestResult from "../classes/TestResult";
    import Transition from "../classes/Transition";
    import DataMatrix from "./DataMatrix";
    import {configFromMatrix, renderSvg} from "../modules/drawer";
    import copy from 'clipboard-copy';

    export default {
        name: 'DirectMode',
        data() {
            return {
                modelSize: 4,
                matrix: [],
                direct: false,
                transition: false,
                display: 'intensity',
                runCount: 10,
                stepCount: 100,
                deadEnds: [],
                testResults: false,
                chainEnd: false,
                chain: [0],
                copied: false,
            }
        },
        components: {
            matrix: DataMatrix,
        },
        asyncComputed: {
            model() {
                let config;
                if (!this.testResults) {
                    config = configFromMatrix(this.matrix, this.direct.stateVisits, this.direct.transitionMatrix, this.transition, this.display, this.deadEnds);
                } else {
                    config = configFromMatrix(this.matrix, this.testResults.stateVisits, this.testResults.transitions, new Transition(-1, -1), this.display, this.deadEnds);
                }
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
            copyChain() {
                copy(this.chain.join(' '))
                    .then(() => {
                        this.copied = true;
                        setTimeout(() => this.copied = false, 750);
                    });
            },
            test() {
                this.transition = false;
                this.deadEnds = [];
                this.testResults = false;

                const direct = new DirectMarkovChain(JSON.parse(JSON.stringify(this.matrix)));
                let testResults = direct.test(this.runCount, this.stepCount);
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
            step() {
                this.init();
                this.transition = this.direct.next();
                if (this.transition.to === null) {
                    this.transition = false;
                    this.chainEnd = true;
                    this.direct.reset();
                } else {
                    if (this.chainEnd) {
                        this.chain = [this.transition.from];
                        this.chainEnd = false;
                    }
                    this.chain.push(this.transition.to);
                }
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
            },
            matrixChange(i, j, value) {
                this.matrix[i][j].value = value;
                this.direct = new DirectMarkovChain(JSON.parse(JSON.stringify(this.matrix)));
                this.transition = false;
                this.deadEnds = [];
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
                if (this.testResults !== false) {
                    this.testResults = false;
                } else {
                    for (let i = 0; i < this.modelSize; i++) {
                        for (let j = 0; j < this.modelSize; j++) {
                            this.matrix[i][j].clear();
                        }
                    }
                    this.direct.reset();
                    this.deadEnds = [];
                }
            }
        }
    }
</script>

<style scoped>

</style>
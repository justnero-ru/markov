<template>
    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Двухсторонняя Марковская цепь</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <button class="btn btn-sm btn-outline-secondary" @click="test">Тестировать</button>
                    <button class="btn btn-sm btn-outline-secondary" @click="normalize">Нормализовать</button>
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
            <h4 class="mt-4">Используемые цепочки для генерации обратной модели</h4>
            <div class="d-flex justify-content-start flex-wrap">
                <div v-for="chain in chains">
                    <div v-if="chain.length > 0"
                         class="markov__chain d-flex justify-content-start flex-wrap pt-2 pb-2 mr-5">
                        <span>{{ chain[0].from}}</span>
                        <span v-for="transition in chain">{{ transition.to }}</span>
                    </div>
                </div>
            </div>
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
    import ReverseMarkovChain from "../classes/ReverseMarkovChain";

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
            }
        },
        components: {
            matrix: DataMatrix,
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
                    this.direct.reset();
                }
            }
        }
    }
</script>

<style scoped>

</style>
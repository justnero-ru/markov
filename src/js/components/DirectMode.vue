<template>
    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Прямая Марковская цепь</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <button class="btn btn-sm btn-outline-primary" @click="test">Тестировать</button>
                    <button class="btn btn-sm btn-outline-primary" :disabled="isTested !== false"
                            @click="step">Шаг
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" :disabled="isTested !== false"
                            @click="normalize">Нормализовать
                    </button>
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
        <matrix :model-size="modelSize" :matrix="matrix" :change="true" @matrix-change="matrixChange"></matrix>

        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2">
            <h2>Модель</h2>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <button class="btn btn-sm btn-outline-primary" :disabled="isTested !== false"
                            @click="step">Шаг
                    </button>
                    <button :class="['btn', 'btn-sm', 'btn-outline-secondary', {'active': display === 'intensity'}]"
                            @click="display='intensity'">Вероятность
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

        <template v-if="chain.length > 0">
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
        </template>

        <div class="markov__model" v-html="model"></div>

        <modal v-if="modalShown" :buttons="modalButtons" @close="modalClose($event)">
            <h3 slot="header" class="text-primary">{{ modalType === 'load' ? 'Загрузить' : 'Сохранить' }}</h3>
            <div class="form-group" slot="body" v-if="modalType === 'load'">
                <input type="file" @change="modalClose">
            </div>
        </modal>
    </main>
</template>

<script>
    import DataMatrix from "./DataMatrix";
    import Modal from "./Modal";
    import {configFromMatrix, renderSvg} from "../modules/drawer";
    import copy from 'clipboard-copy';
    import saveAs from 'file-saver';
    import {createNamespacedHelpers} from "vuex";

    const  {mapActions, mapGetters, mapState} = createNamespacedHelpers('direct');

    export default {
        name: 'DirectMode',
        components: {
            matrix: DataMatrix,
            modal: Modal,
        },
        data() {
            return {
                display: 'intensity',
                copied: false,
                modalShown: false,
                modalType: '',
                modalButtons: [],
            }
        },
        computed: {
            ...mapState({
                matrix: state => state.model.matrix,
                transition: state => state.transition,
                deadEnds: state => state.deadEnds,
                isTested: state => state.isTested,
                chain: state => state.chain,
                chains: state => state.chains,
                chainEnd: state => state.isChainEnded,
                direct: state => state.calculator,
            }),
            ...mapGetters({
                modelConfig: 'config',
            }),
            modelSize: {
                get() {
                    return this.$store.state.direct.model.size;
                },
                set(value) {
                    this.$store.commit('direct/model/resize', value);
                },
            },
            runCount: {
                get() {
                    return this.$store.state.direct.model.chains;
                },
                set(value) {
                    this.$store.commit('direct/model/setChains', value);
                },
            },
            stepCount: {
                get() {
                    return this.$store.state.direct.model.steps;
                },
                set(value) {
                    this.$store.commit('direct/model/setSteps', value);
                },
            },
        },
        asyncComputed: {
            model() {
                const config = configFromMatrix({...this.modelConfig, mode: this.display});
                return renderSvg(config);
            },
        },
        methods: {
            ...mapActions({
                normalize: 'model/normalize',
                matrixClear: 'clear',
                matrixChange: 'matrixChange',
                step: 'step',
                test: 'test',
            }),
            copyChain() {
                copy(this.chain.join(' '))
                    .then(() => {
                        this.copied = true;
                        setTimeout(() => this.copied = false, 750);
                    });
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
                        text = this.$store.getters['direct/model/asText'];
                        saveAs(new Blob([text], {type: "text/plain;charset=utf-8"}), 'markov-input.txt');
                        break;
                    case 'model':
                        saveAs(new Blob([this.model], {type: "text/plain;charset=utf-8"}), 'markov-model.svg');
                        break;
                    case 'chains':
                        text = this.$store.getters['direct/chainsAsText'];
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
                        let promise;
                        if (this.$store.state.direct.isTested) {
                            promise = this.$store.dispatch('direct/clear')
                                .then(() => this.$store.dispatch('direct/clear'));
                        } else {
                            promise = this.$store.dispatch('direct/clear');
                        }
                        promise.then(() => {
                            if (!this.$store.commit('direct/model/loadFromText', event.target.result)) {
                                alert('Формат файла не поддерживается');
                            }
                        });
                    };
                    reader.readAsText(file);

                    return true;
                }
                alert('Формат файла не поддерживается');
            },
        },
    }
</script>

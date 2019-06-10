<template>
    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Прямая Марковская цепь</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <b-dropdown
                        v-b-tooltip.hover
                        title="Сохранить"
                        variant="outline-primary"
                        size="sm"
                        right
                        no-caret>
                    <template slot="button-content">
                        <fa-icon icon="save"/>
                    </template>
                    <b-dropdown-item @click="save('matrix')">Матрицу</b-dropdown-item>
                    <b-dropdown-item @click="save('model.svg')">Модель.svg</b-dropdown-item>
                    <b-dropdown-item @click="save('model.png')">Модель.png</b-dropdown-item>
                    <b-dropdown-item @click="save('results')">Результаты</b-dropdown-item>
                </b-dropdown>
            </div>
        </div>
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
            <h2 class="h4">Настройки</h2>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary"
                            v-b-tooltip.hover
                            title="Тестирование"
                            @click="test">
                        <fa-icon icon="play"/>
                    </button>
                    <button class="btn btn-sm btn-outline-primary"
                            v-b-tooltip.hover
                            title="Шаг"
                            @click="step">
                        <fa-icon icon="walking"/>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary"
                            v-b-tooltip.hover
                            title="Нормализовать"
                            @click="normalize">
                        <fa-icon icon="equals"/>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary"
                            v-b-tooltip.hover
                            title="Очистить"
                            @click="clear">
                        <fa-icon icon="eraser"/>
                    </button>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="model-size">Размерность модели</label>
                    <input type="number" id="model-size" class="form-control" min="2" step="1"
                           v-model="size">
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="steps-count">Максимальнное количество шагов</label>
                    <input type="number" id="steps-count" class="form-control" min="2" step="1"
                           v-model="steps">
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="chains-count">Количество цепочек</label>
                    <input type="number" id="chains-count" class="form-control" min="1" step="1"
                           v-model="chains">
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <matrix-table namespace="direct/model"
                              :size="size"/>
            </div>
            <div class="col text-right">
                <model namespace="direct/model"
                       ref="model"
                       :size="size"/>
            </div>
        </div>
    </main>
</template>

<script>
    import MatrixTable from '@/components/matrix/Table';
    import Model from '@/components/Model';
    import {saveAs} from 'file-saver';
    import {extractSvg, svg2image} from "@/util/svg";

    export default {
        name: 'DirectMode',
        components: {MatrixTable, Model},
        computed: {
            size: {
                get() {
                    return this.$store.state.direct.model.size;
                },
                set(value) {
                    this.$store.commit('direct/model/resize', value)
                },
            },
            steps: {
                get() {
                    return this.$store.state.direct.steps;
                },
                set(value) {
                    this.$store.commit('direct/setSteps', value)
                },
            },
            chains: {
                get() {
                    return this.$store.state.direct.chains;
                },
                set(value) {
                    this.$store.commit('direct/setChains', value)
                },
            },
        },
        methods: {
            async save(what) {
                let blob = false;
                let fileName = false;
                switch (what) {
                    case 'matrix':
                        // noinspection JSIgnoredPromiseFromCall
                        this.$store.dispatch('direct/model/saveMatrix');
                        break;
                    case 'model.svg':
                        saveAs(
                            new Blob([extractSvg(this.$refs.model.$refs.svg)], {type: "image/svg+xml;charset=utf-8"}),
                            'model.svg'
                        );
                        break;
                    case 'model.png':
                        svg2image(this.$refs.model.$refs.svg, blob => {
                            saveAs(blob, 'model.png');
                        });
                        break;
                }
                if (blob && fileName) {
                    saveAs(blob, fileName);
                }
            },
            saveMatrix() {

            },
            async test() {

            },
            async step() {
                return this.$store.dispatch('direct/model/step');
            },
            async normalize() {
                return this.$store.dispatch('direct/model/normalize');
            },
            async clear() {
                return this.$store.dispatch('direct/model/clear');
            },
        },
    }
</script>

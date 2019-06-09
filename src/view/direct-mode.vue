<template>
    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Прямая Марковская цепь</h1>
            <div class="btn-toolbar mb-2 mb-md-0">
                <div class="btn-group mr-2">
                    <button class="btn btn-sm btn-outline-primary" @click="step">Шаг</button>
                    <button class="btn btn-sm btn-outline-secondary" @click="normalize">Нормализовать</button>
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
                           v-model="size">
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
                       :size="size"/>
            </div>
        </div>
    </main>
</template>

<script>
    import MatrixTable from '@/components/matrix/Table';
    import Model from '@/components/Model';

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
        },
        methods: {
            onCellChange(params) {
                this.$store.commit('direct/model/set', params);
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

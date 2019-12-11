<template>
    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
        <v-title name="Исследование Марковской модели"
                 action-save
                 @save="mode => save(mode)"/>
        <v-actions
                :can-normalize="!isTested"
                can-test
                can-clear
                @test="test"
                @normalize="normalize"
                @clear="clear"/>
        <v-settings :rows="fieldsConfig"
                    v-model="settings"/>
        <div class="row mb-5">
            <div class="col col-xs-12">
                <matrix-table namespace="research/model"
                              eps-changeable
                              :size="settings.size"/>
            </div>
            <div class="col col-xs-12 text-xs-center text-right">
                <model namespace="research/model"
                       ref="model"
                       :size="settings.size"/>
            </div>
        </div>
        <div class="row">
            <div class="col text-right">
                <button class="btn btn-sm btn-outline-primary" @click="showIntermediate = !showIntermediate">
                    {{ showIntermediate ? 'Скрыть промежуточные модели' : 'Показать промежуточные модели'}}
                </button>
            </div>
        </div>
        <div v-for="index in iterationsTested"
                  :key="index">
            <div class="row mt-2"
                 v-if="showIntermediate || index === iterationsTested">
                <div class="col-12">
                    <h2 class="h4 mb-3" v-if="index < iterationsTested">Промежуточная модель {{ index }} порядка</h2>
                    <h2 class="h4 mb-3" v-else>Итоговая модель</h2>
                </div>
                <div class="col col-xs-12">
                    <matrix-table namespace="research/multiModel"
                                  compare-namespace="research/model"
                                  read-only
                                  :index="index-1"
                                  :eps="settings.eps"
                                  :size="settings.size"/>
                </div>
                <div class="col col-xs-12 text-xs-center text-right">
                    <model namespace="research/multiModel"
                           :index="index-1"
                           :ref="`model_${index}`"
                           :size="settings.size"/>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
    import vTitle from '@/components/ui/vTitle'
    import vActions from '@/components/ui/vActions'
    import VSettings from "@/components/ui/vSettings"
    import MatrixTable from '@/components/matrix/Table'
    import Model from '@/components/Model'
    import {saveAs} from 'file-saver'
    import {extractSvg, svg2image} from '@/util/svg'

    export default {
        name: 'ResearchMode',
        components: {vTitle, vActions, VSettings, MatrixTable, Model},
        data: () => ({
            showIntermediate: false,
        }),
        computed: {
            settings: {
                get() {
                    return {
                        size: this.$store.state.research.model.size,
                        steps: this.$store.state.research.steps,
                        chains: this.$store.state.research.chains,
                        iterations: this.$store.state.research.iterations,
                        eps: this.$store.state.research.eps,
                        distribution: this.$store.state.research.distribution,
                        distributionA: this.$store.state.research.distributionA,
                        distributionB: this.$store.state.research.distributionB,
                    };
                },
                set(value) {
                    const mutations = {
                        size: 'research/model/resize',
                        steps: 'research/setSteps',
                        chains: 'research/setChains',
                        iterations: 'research/setIterations',
                        eps: 'research/setEps',
                        distribution: 'research/setDistribution',
                        distributionA: 'research/setDistributionA',
                        distributionB: 'research/setDistributionB',
                    };
                    Object.keys(mutations)
                        .forEach(key => {
                            if (this.settings[key] !== value[key]) {
                                this.$store.commit(mutations[key], value[key]);
                            }
                        });
                },
            },
            fieldsConfig() {
                return [
                    [
                        {name: 'size', label: 'Размерность модели', min: 2},
                        {name: 'steps', label: 'Максимальнное количество шагов', min: 2, max: null},
                        {name: 'chains', label: 'Количество цепочек', max: null},
                        {name: 'iterations', label: 'Количество итераций', max: null},
                    ],
                    [
                        {name: 'eps', label: 'Точность 𝜀', min: 2},
                        {
                            name: 'distribution',
                            label: 'Вид распределения',
                            type: 'select',
                            options: {
                                uniform: 'Равномерное',
                                normal: 'Нормальное',
                                logNormal: 'Лог нормальное',
                                exponential: 'Экспоненциальное',
                            },
                        },
                        {
                            name: 'distributionA',
                            label({distribution}) {
                                switch (distribution) {
                                    case 'uniform':
                                        return 'Минимальное время пребывания <i>t<sub>min</sub></i>';
                                    case 'normal':
                                    case 'logNormal':
                                        return 'Среднее <i>mean</i>';
                                    default:
                                        return '...';
                                }
                            },
                            min: null,
                            step: null,
                            max: null,
                        },
                        {
                            name: 'distributionB',
                            label({distribution}) {
                                switch (distribution) {
                                    case 'uniform':
                                        return 'Максимальное время пребывания <i>t<sub>max</sub></i>';
                                    case 'normal':
                                    case 'logNormal':
                                        return 'Стандартное отклонение <i>stdev</i>';
                                    default:
                                        return '...';
                                }
                            },
                            min: null,
                            step: null,
                            max: null,
                        },
                    ],
                ];
            },
            transitions() {
                return this.$store.state.research.model.chains;
            },
            iterationsTested() {
                return this.$store.state.research.multiModel.iterations;
            },
            isTested() {
                return this.iterationsTested > 0;
            },
        },
        methods: {
            async save(what) {
                switch (what) {
                    case 'xlsx':
                        await this.$store.dispatch('research/save');
                        break;
                    case 'svg':
                        saveAs(
                            new Blob([extractSvg(this.$refs.model.$refs.svg)], {type: "image/svg+xml;charset=utf-8"}),
                            'model.svg'
                        );
                        break;
                    case 'png':
                        svg2image(this.$refs.model.$refs.svg, blob => {
                            saveAs(blob, 'model.png');
                        });
                        break;
                }
            },
            async test() {
                return this.$store.dispatch('research/test');
            },
            async normalize() {
                return this.$store.dispatch('research/model/normalize');
            },
            async clear() {
                return this.$store.dispatch('research/clear');
            },
        },
    }
</script>

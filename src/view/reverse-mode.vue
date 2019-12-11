<template>
    <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
        <v-title name="Обратная Марковская модель"
                 action-save
                 @save="mode => save(mode)"/>
        <v-actions
                :can-step="!isTested"
                :can-normalize="!isTested"
                can-test
                can-clear
                @test="test"
                @step="step"
                @normaliz="normalize"
                @clear="clear"/>
        <v-settings-row :fields="fieldsConfig"
                        v-model="settings"/>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="transitions-plain">Цепочки</label>
                    <textarea id="transitions-plain" rows="3" class="form-control w-100"
                              v-model="transitionsPlain"></textarea>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <matrix-table :size="settings.size"
                              namespace="reverse/model"
                              read-only/>
            </div>
            <div class="col text-right">
                <model namespace="reverse/model"
                       ref="model"
                       :size="settings.size"/>
            </div>
        </div>
        <chains :transitions="transitions"/>
    </main>
</template>

<script>
    import MatrixTable from '@/components/matrix/Table';
    import Model from '@/components/Model';
    import Chains from '@/components/Chains';
    import vTitle from '@/components/ui/vTitle';
    import vActions from '@/components/ui/vActions';
    import vSettingsRow from '@/components/ui/vSettingsRow';
    import {saveAs} from 'file-saver';
    import {extractSvg, svg2image} from '@/util/svg';

    export default {
        name: 'ReverseMode',
        components: {MatrixTable, Model, Chains, vTitle, vActions, vSettingsRow},
        computed: {
            settings: {
                get() {
                    return {
                        size: this.$store.state.reverse.model.size,
                        steps: this.$store.state.reverse.steps,
                        chains: this.$store.state.reverse.chains,
                    };
                },
                set(value) {
                    const mutations = {
                        size: 'reverse/model/resize',
                        steps: 'reverse/setSteps',
                        chains: 'reverse/setChains',
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
                    {
                        name: 'size',
                        label: 'Размерность модели',
                        min: 2,
                    },
                    {
                        name: 'steps',
                        label: 'Максимальнное количество шагов',
                        min: 2,
                        max: null,
                    },
                    {
                        name: 'chains',
                        label: 'Количество цепочек',
                        max: null,
                    },
                ];
            },
            transitionsPlain: {
                get() {
                    return this.$store.state.reverse.transitionsPlain;
                },
                set(value) {
                    this.$store.commit('reverse/setTransitionsPlain', value);
                    this.$store.commit('reverse/model/setTransitionsPlain', value);
                },
            },
            transitions() {
                return this.$store.state.reverse.model.chains;
            },
            isTested() {
                return this.$store.state.reverse.model.current === -1;
            },
        },
        methods: {
            async save(what) {
                let blob = false;
                let fileName = false;
                switch (what) {
                    case 'xlsx':
                        // noinspection JSIgnoredPromiseFromCall
                        this.$store.dispatch('reverse/save');
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
                if (blob && fileName) {
                    saveAs(blob, fileName);
                }
            },
            async test() {
                return this.$store.dispatch('reverse/test');
            },
            async step() {
                return this.$store.dispatch('reverse/model/step');
            },
            async normalize() {
                return this.$store.dispatch('reverse/model/normalize');
            },
            async clear() {
                return this.$store.dispatch('reverse/model/clear');
            },
        },
    };
</script>

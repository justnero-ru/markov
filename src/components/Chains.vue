<template>
    <div v-if="isTransitionsAvailable">
        <div class="d-flex justify-content-start flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
            <h4 class="mb-0">Цепочки</h4>
            <div class="btn-toolbar ml-3">
                <div class="btn-group">
                    <button class="btn btn-sm btn-sm btn-outline-primary"
                            v-b-tooltip.hover
                            :title="isTransitionsShown ? 'Скрыть' : 'Показать'"
                            @click="isTransitionsShown = !isTransitionsShown">
                        <fa-icon :icon="isTransitionsShown ? 'caret-up' : 'caret-down'"/>
                    </button>
                    <button class="btn btn-sm btn-outline-primary"
                            v-b-tooltip.hover
                            title="Скопировать"
                            @click="copyTransitions">
                        <fa-icon icon="copy"/>
                    </button>
                </div>
            </div>
        </div>
        <template v-if="isTransitionsShown">
            <p v-for="(chain, index) in transitionsHumanized" :key="index">
                {{chain}}
            </p>
        </template>
    </div>
</template>

<script>
    export default {
        name: 'Chains',
        props: {
            copy: {
                type: Boolean,
                default: true,
            },
            transitions: {
                type: Array,
                default: () => [[0]],
            }
        },
        data() {
            return {
                isTransitionsShown: false,
            };
        },
        computed: {
            transitionsPlain() {
                return this.transitions.map(chain => chain.join(' ')).join('\n');
            },
            transitionsHumanized() {
                return this.transitions.map(chain => chain.join(' ↠ '));
            },
            isTransitionsAvailable() {
                return this.transitions.length > 1 || this.transitions[0].length > 1;
            },
        },
        methods: {
            async copyTransitions() {
                return navigator.clipboard.writeText(this.transitionsPlain);
            },
        },
    };
</script>

<template>
    <div>
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
            <h2 class="h4">{{name}}</h2>
            <div class="btn-toolbar mb-2 mb-md-0" v-if="hasActions">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary"
                            v-if="canStep"
                            v-b-tooltip.hover
                            title="Шаг"
                            @click="$emit('step')">
                        <fa-icon icon="walking"/>
                    </button>
                    <button class="btn btn-sm btn-outline-warning"
                            v-if="canNormalize"
                            v-b-tooltip.hover
                            title="Нормализовать"
                            @click="$emit('normalize')">
                        <fa-icon icon="equals"/>
                    </button>
                    <button class="btn btn-sm btn-outline-primary"
                            v-if="canTest"
                            v-b-tooltip.hover
                            title="Тестирование"
                            @click="$emit('test')">
                        <fa-icon icon="play"/>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary"
                            v-if="canClear"
                            v-b-tooltip.hover
                            title="Очистить"
                            @click="$emit('clear')">
                        <fa-icon icon="eraser"/>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'vActions',
        props: {
            name: {
                type: String,
                default: 'Настройки',
            },
            canTest: {
                type: Boolean,
                default: false,
            },
            canStep: {
                type: Boolean,
                default: false,
            },
            canNormalize: {
                type: Boolean,
                default: false,
            },
            canClear: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            hasActions() {
                return this.canTest || this.canStep || this.canNormalize || this.canClear;
            },
        },
    }
</script>

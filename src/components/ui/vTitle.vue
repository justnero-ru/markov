<template>
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="h2">{{name}}</h1>
        <div class="btn-toolbar mb-2 mb-md-0" v-if="hasActions">
            <b-dropdown
                    v-if="actionSave"
                    v-b-tooltip.hover
                    title="Сохранить"
                    variant="outline-primary"
                    size="sm"
                    right
                    no-caret>
                <template slot="button-content">
                    <fa-icon icon="save"/>
                </template>
                <b-dropdown-item @click="save('xlsx')">.xlsx</b-dropdown-item>
                <b-dropdown-item @click="save('svg')">.svg</b-dropdown-item>
                <b-dropdown-item @click="save('png')">.png</b-dropdown-item>
            </b-dropdown>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'vTitle',
        props: {
            name: {
                type: String,
                required: true,
            },
            actionSave: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            hasActions() {
                return this.actionSave;
            },
        },
        methods: {
            save(mode) {
                this.$emit('save', mode)
            },
        },
    }
</script>

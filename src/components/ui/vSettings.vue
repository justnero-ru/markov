<template>
    <div>
        <v-settings-row v-for="(row, index) in rows"
                        :key="index"
                        :fields="row"
                        :value="value"
                        @input="val => $emit('input', val)"/>
    </div>
</template>

<script>
    import vSettingsRow from '@/components/ui/vSettingsRow';

    export default {
        name: 'vSettings',
        props: {
            rows: {
                type: Array,
                required: true,
            },
            value: {
                type: Object,
            },
        },
        components: {
            vSettingsRow,
        },
    };
</script>

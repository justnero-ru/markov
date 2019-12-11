<template>
    <div class="row mb-4">
        <v-settings-field v-for="field in fields"
                          :key="field.name"
                          v-bind="field"
                          :value="value[field.name]"
                          :values="value"
                          @input="val => changeValue(field.name, val)"/>
    </div>
</template>

<script>
    import vSettingsField from '@/components/ui/vSettingsField';

    export default {
        name: 'vSettingsRow',
        props: {
            fields: {
                type: Array,
                required: true,
            },
            value: {
                type: Object,
            },
        },
        components: {
            vSettingsField,
        },
        methods: {
            changeValue(fieldName, val) {
                this.$emit('input', {
                    ...this.value,
                    [fieldName]: val,
                });
            },
        },
    };
</script>

<template>
    <div class="col d-flex flex-column justify-content-end">
        <label :for="name" v-html="labelFormatted"></label>

        <input v-if="type === 'number'"
               type="number"
               class="form-control"
               :id="name"
               :value="value"
               :min="min"
               :step="step"
               :max="max"
               @input="$event => $emit('input', $event.target.value)"/>
        <select v-if="type === 'select'"
                class="form-control"
                :value="value"
                @change="$event => $emit('input', $event.target.value)">
            <option v-for="(val, key) in options" :key="key" :value="key">{{val}}</option>
        </select>
    </div>
</template>

<script>
    export default {
        name: 'vSettingsField',
        props: {
            name: {
                type: String,
            },
            label: {
                type: [String, Function],
            },
            type: {
                type: String,
                default: 'number',
            },
            min: {
                type: Number,
                default: 1,
            },
            step: {
                type: Number,
                default: 1,
            },
            max: {
                type: Number,
                default: 100,
            },
            options: {
                type: Object,
                default: () => ({}),
            },
            value: {
                required: true,
            },
            values: {
                type: Object,
            },
        },
        computed: {
            labelFormatted() {
                if (typeof this.label === 'string') {
                    return this.label;
                }

                return this.label(this.values);
            },
        },
    };
</script>

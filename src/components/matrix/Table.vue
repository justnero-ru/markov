<template>
    <table :class="{'markov__table': true, 'markov__table__compared': compareNamespace}">
        <thead>
        <tr>
            <th @click="changeMode">{{label}}</th>
            <th v-for="i in size" :key="i - 1">{{label}}<sub>{{ i - 1 }}</sub></th>
        </tr>
        </thead>
        <tbody>
        <matrix-row v-for="i in size"
                    :key="i - 1"
                    :index="index"
                    :x="i - 1"
                    :size="size"
                    :namespace="namespace"
                    :compare-namespace="compareNamespace"
                    :eps="eps"
                    :read-only="readOnly"
                    :mode="mode"
                    :label="label"/>
        </tbody>
    </table>
</template>

<script>
    import MatrixRow from '@/components/matrix/Row';

    export default {
        name: 'MatrixTable',
        components: {MatrixRow},
        props: {
            size: {
                type: Number,
                required: true,
            },
            namespace: {
                type: String,
                required: true,
            },
            compareNamespace: {
                type: String,
                default: null,
            },
            eps: {
                type: Number,
                default: 0,
            },
            readOnly: {
                type: Boolean,
                default: false,
            },
            epsChangeable: {
                type: Boolean,
                default: false,
            },
            index: {
                type: Number,
                default: -1,
            },
        },
        data: () => ({
            mode: 'value',
        }),
        computed: {
            label() {
                switch (this.mode) {
                    case 'eps':
                        return '𝜀';
                    case 'value':
                    default:
                        return 'S';
                }
            },
            availableModes() {
                const modes = ['value'];
                if (this.epsChangeable) {
                    modes.push('eps');
                }

                return modes;
            },
        },
        methods: {
            changeMode() {
                let index = this.availableModes.indexOf(this.mode);
                this.mode = this.availableModes[(index + 1) % this.availableModes.length];
            },
        },
    }
</script>

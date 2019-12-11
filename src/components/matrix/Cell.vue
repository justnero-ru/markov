<template>
    <td :class="classes">
        <template v-if="mode === 'value'">
            <span v-if="readOnly">{{value}}</span>
            <input type="text"
                   v-else
                   v-model="value"
                   @blur="$event => forceUpdate($event.target.value)"/>
        </template>
    </td>
</template>

<script>
    import Cell from "@/util/Cell";

    export default {
        name: 'MatrixCell',
        props: {
            x: {
                type: Number,
                required: true,
            },
            y: {
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
            mode: {
                type: String,
                required: true,
            },
            index: {
                type: Number,
                default: -1,
            },
        },
        data: () => ({
            timer: null,
        }),
        computed: {
            classes() {
                if(!this.compareNamespace) {
                    return '';
                }

                let state = this.$store.state;
                let relatedState = this.$store.state;
                this.namespace.split('/')
                    .forEach(path => state = state[path]);
                this.compareNamespace.split('/')
                    .forEach(path => relatedState = relatedState[path]);

                if (this.compareNamespace) {
                    const eps = this.eps === 0 ? relatedState.matrix[this.x][this.y].eps : this.eps;
                    const current = this.index >= 0
                        ? state.matrices[this.index][this.x][this.y].value
                        : state.matrix[this.x][this.y].value;
                    const related = relatedState.matrix[this.x][this.y].value;

                    if (related < eps) {
                        return 'zero same';
                    }
                    if (Math.abs(related - current) < eps) {
                        return 'same';
                    }
                }

                return '';
            },
            value: {
                get() {
                    let state = this.$store.state;
                    this.namespace.split('/')
                        .forEach(path => state = state[path]);

                    if (this.index >= 0) {
                        return Cell.format({
                            value: state.matrices[this.index][this.x][this.y].value,
                            precision: .001,
                        });
                    }

                    return Cell.format({
                        value: state.matrix[this.x][this.y].value,
                        precision: .001,
                    });
                },
                set(value) {
                    if (this.timer !== null) {
                        clearTimeout(this.timer);
                    }
                    this.timer = setTimeout(() => {
                        this.$store.commit(`${this.namespace}/set`, {x: this.x, y: this.y, value});
                    }, 500);
                },
            },
        },
        methods: {
            forceUpdate(value) {
                if (this.timer !== null) {
                    clearTimeout(this.timer);
                }
                this.$store.commit(`${this.namespace}/set`, {x: this.x, y: this.y, value});
            },
        },
    }
</script>

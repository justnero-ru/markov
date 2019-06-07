<template>
    <td>
        <input type="text"
               v-model="value"
               @blur="$forceUpdate()"/>
    </td>
</template>

<script>
    export default {
        name: 'MatrixCell',
        props: ['x', 'y', 'namespace'],
        computed: {
            value: {
                get() {
                    let state = this.$store.state;
                    this.namespace.split('/')
                        .forEach(path => state = state[path]);

                    return state.matrix[this.x][this.y].value;
                },
                set(value) {
                    this.$store.commit(`${this.namespace}/set`, {
                        x: this.x,
                        y: this.y,
                        value: value,
                    });
                },
            },
        },
    }
</script>

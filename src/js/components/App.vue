<template>
    <div class="app-wrap">
        <nav class="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
            <a class="navbar-brand col-md-3 col-lg-2 mr-0" href="#">Markov Modeling</a>
            <ul class="navbar-nav px-3">
                <li class="nav-item text-nowrap">
                    <a class="nav-link" href="https://sevsu.ru">SevSU</a>
                </li>
            </ul>
        </nav>

        <div class="container-fluid">
            <div class="row">
                <Sidebar></Sidebar>
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import Sidebar from './Sidebar';
    import DirectMode from './DirectMode';
    import ReverseMode from './ReverseMode';
    import DoubleMode from './DoubleMode';

    export default {
        name: 'App',
        data: () => ({
            currentMode: 'direct',
        }),
        computed: {
            currentComponent() {
                return _.upperFirst(this.currentMode) + 'Mode';
            },
        },
        components: {
            Sidebar,
            DirectMode,
            ReverseMode,
            DoubleMode,
        }
    }
</script>

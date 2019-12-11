<template>
    <div class="app-wrap">
        <nav class="navbar navbar-dark bg-dark flex-md-nowrap p-0 shadow">
            <a class="navbar-brand col-md-3 col-lg-2 mr-0" href="#">Markov Modeling</a>
            <ul class="navbar-nav px-3">
                <li class="nav-item text-nowrap">
                    <a class="nav-link" href="https://sevsu.ru">SevSU</a>
                </li>
            </ul>
        </nav>

        <div class="container-fluid">
            <div class="row">
                <sidebar></sidebar>
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script>
    import sidebar from './components/Sidebar';

    export default {
        name: 'App',
        components: {
            sidebar,
        },
    }
</script>

<style lang="sass">
    @import 'sass/markov'
</style>

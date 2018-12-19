const mix = require('laravel-mix');

mix.js('src/js/markov.js', 'dist/js').sourceMaps()
    .sass('src/sass/markov.scss', 'dist/css')
    .copy('node_modules/font-awesome/fonts', 'dist/fonts')
    .options({
        fileLoaderDirs: {
            fonts: 'dist/fonts'
        },
        processCssUrls: false,
    })
    .autoload({
        jquery: ['$', 'window.jQuery', 'jQuery']
    });
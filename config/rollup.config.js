export default {
    input: './es/sGis.js',
    output: {
        file: './dist/sGis_bundle.js',
        format: 'umd',
        name: 'sGis',
        sourcemap: true
    },
    // plugins: [
    //     typescript({
    //         typescript: require('typescript'),
    //         cacheRoot: `./.rts2_cache_esm`,
    //         useTsconfigDeclarationDir: true,
    //         tsconfigDefaults: {
    //             compilerOptions: {
    //                 sourceMap: true,
    //                 declaration: true,
    //                 declarationDir: './dist',
    //             },
    //         },
    //         tsconfigOverride: {
    //             compilerOptions: {
    //                 target: 'esnext',
    //             },
    //         },
    //     }),
    // ]
}
import { DEFAULT_EXTENSIONS } from "@babel/core";
import typescript from "rollup-plugin-typescript2";
import sourceMaps from 'rollup-plugin-sourcemaps';
import babel from "rollup-plugin-babel";
import json from "rollup-plugin-json"
import resolve from 'rollup-plugin-node-resolve';

const babelOptions =
{
    exclude: 'node_modules/**',
    extensions: [...DEFAULT_EXTENSIONS, 'ts', 'tsx'],
    passPerPreset: true, // @see https://babeljs.io/docs/en/options#passperpreset
    plugins: [
        require.resolve('babel-plugin-annotate-pure-calls')
    ].filter(Boolean),
};

export default {
    input: "./source/sGis.ts",
    output: [
        {
            file: "./es/sGis.esm.js",
            format: "esm",
            name: "sGis",
            treeshake: {
                propertyReadSideEffects: false,
            },
            sourcemap: true,
            exports: 'named'
        }
    ],
    plugins: [
        resolve({ mainFields: ["module", "main", "browser"]}),
        json(),
        typescript({
            typescript: require('typescript'),
            cacheRoot: `./.rts2_cache_esm`,
            //useTsconfigDeclarationDir: true,
            tsconfigDefaults: {
                compilerOptions: {
                    sourceMap: true,
                    declaration: true,
                    //declarationDir: './dist',
                },
            },
            tsconfigOverride: {
                compilerOptions: {
                    target: 'esnext',
                },
            },
        }),
        babel(babelOptions),
        sourceMaps()
    ],
};


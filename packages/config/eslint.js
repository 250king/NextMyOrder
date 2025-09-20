import {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {FlatCompat} from "@eslint/eslintrc";
import stylistic from '@stylistic/eslint-plugin';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        plugins: {
            '@stylistic': stylistic,
        },
        rules: {
            '@stylistic/member-delimiter-style': ['error', {
                multiline: {
                    delimiter: 'comma',
                    requireLast: true,
                },
                singleline: {
                    delimiter: 'comma',
                    requireLast: false,
                },
            }],
            'prefer-arrow-callback': ['error', {
                allowNamedFunctions: false,
                allowUnboundThis: true,
            }],
            "@typescript-eslint/no-explicit-any": "off",
            'keyword-spacing': ['error', {before: true, after: true}],
            'brace-style': ['error', '1tbs', {allowSingleLine: false}],
            'arrow-spacing': ['error', {before: true, after: true}],
            'no-multiple-empty-lines': ['error', {max: 1}],
            'comma-dangle': ['error', 'always-multiline'],
            'func-call-spacing': ['error', 'never'],
            'func-style': ['error', 'expression'],
            "curly": ["error", "multi-line"],
            'eol-last': ['error', 'always'],
            'no-trailing-spaces': 'error',
            'semi': ["error", "always"],
            "no-fallthrough": "error",
        },
    },
];

export default eslintConfig;

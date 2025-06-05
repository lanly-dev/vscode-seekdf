import typescriptEslint from '@typescript-eslint/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [{
  files: ['**/*.ts']
}, {
  ignores: ['**/out', '**/dist', '.vscode-test']
}, {
  plugins: {
    '@typescript-eslint': typescriptEslint,
    '@stylistic': stylistic
  },
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/naming-convention': ['warn', { selector: 'import', format: ['camelCase', 'PascalCase'] }],
    '@stylistic/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none',
          requireLast: false
        },
        singleline: {
          delimiter: 'comma',
          requireLast: false
        }
      }
    ],
    'comma-dangle': ['error', 'never'],
    'eol-last': ['error', 'always'],
    'max-len': ['error', { code: 120 }],
    'no-throw-literal': 'warn',
    'no-trailing-spaces': 'error',
    'quote-props': ['error', 'as-needed'],
    curly: ['error', 'multi-or-nest'],
    eqeqeq: 'error',
    indent: ['error', 2],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    semi: ['error', 'never']
  }
}]

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // Prettier config to disable conflicting rules
  prettier,

  // Global ignores
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '*.min.js',
      '.devcontainer/**',
      'tmp/**',
      'temp/**',
    ],
  },

  // Backend TypeScript files configuration
  {
    files: ['src/backend/**/*.ts', '**/*.ts', '**/*.tsx'],
    ignores: ['src/frontend/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // TypeScript specific rules (without type-checking rules)
      ...(typescript.configs['recommended']?.rules ?? {}),

      // Custom TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
        },
      ],
    },
  },

  // Frontend TypeScript files configuration
  {
    files: ['src/frontend/**/*.ts', 'src/frontend/**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // TypeScript specific rules (without type-checking rules)
      ...(typescript.configs['recommended']?.rules ?? {}),

      // Custom TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
        },
      ],
    },
  },

  // JavaScript files configuration
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // Core JavaScript rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-param-reassign': ['error', { props: false }],
      'no-nested-ternary': 'error',
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      'prefer-destructuring': [
        'error',
        {
          array: false,
          object: true,
        },
      ],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'warn',
      'no-promise-executor-return': 'error',
      'require-atomic-updates': 'error',
      'max-nested-callbacks': ['error', 3],
      'no-shadow': 'error',
      'no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: true,
        },
      ],
      camelcase: [
        'error',
        {
          properties: 'never',
          ignoreDestructuring: false,
          ignoreImports: false,
          ignoreGlobals: false,
        },
      ],
      'new-cap': [
        'error',
        {
          newIsCap: true,
          capIsNew: true,
          properties: true,
        },
      ],
      'no-underscore-dangle': [
        'error',
        {
          allow: ['_id', '_rev', '__dirname', '__filename'],
          allowAfterThis: false,
          allowAfterSuper: false,
          allowAfterThisConstructor: false,
          enforceInMethodNames: true,
          allowFunctionParams: true,
        },
      ],
      'no-multi-assign': 'error',
      'no-plusplus': 'off',
      'prefer-exponentiation-operator': 'error',
      'no-bitwise': 'warn',
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-labels': 'error',
      'no-iterator': 'error',
      'no-proto': 'error',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-with': 'error',
      radix: 'error',
      'wrap-iife': ['error', 'inside'],
      yoda: 'error',
      'no-undef': 'error',
      'no-undef-init': 'error',
      'no-buffer-constructor': 'error',
      'no-new-require': 'error',
      'no-path-concat': 'error',
      'consistent-return': 'error',
      'handle-callback-err': 'error',
      'no-mixed-requires': 'error',
      'no-new-func': 'error',
      'no-return-assign': 'error',
      'no-new-wrappers': 'error',
      'no-octal-escape': 'error',
      'no-redeclare': 'error',
      strict: ['error', 'never'],
      'guard-for-in': 'error',
      'no-caller': 'error',
    },
  },

  // Test files configuration
  {
    files: [
      '**/*.test.ts',
      '**/*.test.js',
      '**/*.spec.ts',
      '**/*.spec.js',
      'tests/**/*.js',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'max-nested-callbacks': 'off',
      'no-await-in-loop': 'off',
      'no-shadow': 'off',
      'no-unused-vars': 'off',
    },
  },
];

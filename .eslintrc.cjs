module.exports = {
  root: true,
  env: {
    browser: true, node: true, es2020: true
  },
  extends: ["eslint:recommended", "plugin:import/errors"],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "react", "react-hooks", "@typescript-eslint"],
  settings: {
    react: {
      version: "18.0"
    }
  },
  rules: {
    "react-refresh/only-export-components": ["warn", {
      allowConstantExport: true
    }]
  },
  overrides: [{
    files: ["*.ts", "*.tsx"],
    env: {
      es6: true
    },
    extends: [
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:import/typescript",
      "plugin:react/jsx-runtime"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaFeatures: {
        jsx: "react-jsx"
      }, ecmaVersion: 2022, sourceType: "module"
    },
    settings: {
      "import/resolver": {
        "eslint-import-resolver-typescript": true
      }
    },
    rules: {
      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/array-type": ["error", {
        "default": "array-simple"
      }],
      "@typescript-eslint/ban-types": "error",
      "@typescript-eslint/brace-style": ["error", "1tbs", {
        "allowSingleLine": true
      }],
      "@typescript-eslint/consistent-type-assertions": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/explicit-member-accessibility": ["error", {
        "overrides": {
          "constructors": "off"
        }
      }],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/indent": ["error", 4, {
        "FunctionDeclaration": {
          "parameters": "first"
        }, "FunctionExpression": {
          "parameters": "first"
        }, "flatTernaryExpressions": true
      }],
      "@typescript-eslint/member-delimiter-style": "error",
      "@typescript-eslint/naming-convention": ["error", {
        "selector": "class", "format": ["PascalCase"]
      }, {
        "selector": "interface", "prefix": ["I"], "format": ["PascalCase"]
      }],
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-parameter-properties": "off",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-use-before-declare": "off",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/prefer-namespace-keyword": "error",
      "@typescript-eslint/triple-slash-reference": "error",
      "@typescript-eslint/type-annotation-spacing": "error",
      "@typescript-eslint/unified-signatures": "error",
      "array-bracket-spacing": ["error", "never"],
      "arrow-body-style": "error",
      "arrow-parens": ["error", "always"],
      "camelcase": ["error", {
        "allow": ["^UNSAFE_", "^unstable_"]
      }],
      "comma-dangle": "error",
      "comma-spacing": "error",
      "computed-property-spacing": ["error", "never"],
      "constructor-super": "error",
      "curly": "error",
      "dot-notation": "error",
      "eol-last": "error",
      "eqeqeq": ["error", "always", {
        "null": "ignore"
      }],
      "func-call-spacing": "error",
      "guard-for-in": "error",
      "import/order": ["error", {
        "groups": [["builtin", "external"], ["index", "sibling", "parent", "internal", "object"]],
        "newlines-between": "always"
      }],
      "keyword-spacing": "error",
      "linebreak-style": ["error", "unix"],
      "max-classes-per-file": ["error", 1],
      "max-len": ["error", {
        "code": 120, "ignoreUrls": true, "ignoreRegExpLiterals": true, "ignoreStrings": true
      }],
      "new-parens": "error",
      "no-bitwise": "off",
      "no-caller": "error",
      "no-cond-assign": "error",
      "no-console": "error",
      "no-control-regex": "error",
      "no-debugger": "error",
      "no-empty": "off",
      "no-eval": "error",
      "no-invalid-regexp": "error",
      "no-invalid-this": "off",
      "no-irregular-whitespace": "error",
      "no-multi-spaces": ["error", {
        "ignoreEOLComments": true
      }],
      "no-multiple-empty-lines": "error",
      "no-new-wrappers": "error",
      "no-prototype-builtins": "off",
      "no-shadow": "off",
      "no-throw-literal": "error",
      "no-trailing-spaces": "error",
      "no-undef-init": "error",
      "no-unsafe-finally": "error",
      "no-unused-expressions": "error",
      "no-unused-labels": "error",
      "no-unused-vars": "off",
      "no-var": "error",
      "object-curly-spacing": ["error", "never"],
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "quote-props": ["error", "as-needed"],
      "quotes": ["error", "single"],
      "radix": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
      "react/jsx-closing-bracket-location": "error",
      "react/jsx-closing-tag-location": "error",
      "react/jsx-curly-spacing": ["error", "never"],
      "react/jsx-equals-spacing": ["error", "never"],
      "react/jsx-fragments": "error",
      "react/jsx-handler-names": "off",
      "react/jsx-key": "error",
      "react/jsx-pascal-case": "error",
      "react/jsx-props-no-multi-spaces": "error",
      // "react/react-in-jsx-scope": "off",
      "react/jsx-tag-spacing": ["error", {
        "closingSlash": "never",
        "beforeSelfClosing": "always",
        "afterOpening": "never",
        "beforeClosing": "never"
      }],
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/jsx-wrap-multilines": "error",
      "react/no-deprecated": "error",
      "react/no-render-return-value": "error",
      "react/no-unknown-property": ["error", {
        "ignore": ["css"]
      }],
      "react/prop-types": "off",
      "react/self-closing-comp": "error",
      "react/state-in-constructor": "error",
      "semi": ["error", "always"],
      "space-before-function-paren": ["error", {
        "anonymous": "always", "named": "never", "asyncArrow": "always"
      }],
      "space-in-parens": "error",
      "spaced-comment": ["error", "always"],
      "use-isnan": "error"
    }
  }, {
    "files": ["*.js"], "parserOptions": {
      "ecmaVersion": 5, "sourceType": "script"
    }, "rules": {
      "array-bracket-spacing": ["error", "never"],
      "arrow-body-style": ["error", "as-needed"],
      "block-spacing": ["error", "always"],
      "brace-style": ["error", "1tbs", {
        "allowSingleLine": true
      }],
      "callback-return": "error",
      "camelcase": ["error", {
        "properties": "never"
      }],
      "comma-dangle": ["error", "never"],
      "comma-spacing": "error",
      "comma-style": ["error", "last"],
      "computed-property-spacing": "error",
      "consistent-this": ["error", "self"],
      "curly": ["error", "all"],
      "dot-notation": "error",
      "eol-last": "error",
      "func-call-spacing": ["error", "never"],
      "indent": ["error", 4, {
        "SwitchCase": 1
      }],
      "key-spacing": ["error", {
        "beforeColon": false, "afterColon": true
      }],
      "keyword-spacing": ["error", {
        "before": true, "after": true, "overrides": {}
      }],
      "linebreak-style": ["error", "unix"],
      "max-len": ["error", 120],
      "newline-after-var": "warn",
      "no-console": "error",
      "no-control-regex": "error",
      "no-duplicate-case": "error",
      "no-empty-character-class": "error",
      "no-ex-assign": "error",
      "no-extend-native": "error",
      "no-extra-boolean-cast": "error",
      "no-extra-semi": "error",
      "no-inline-comments": "error",
      "no-inner-declarations": "error",
      "no-invalid-regexp": "error",
      "no-irregular-whitespace": "error",
      "no-lone-blocks": "error",
      "no-lonely-if": "warn",
      "no-mixed-spaces-and-tabs": "error",
      "no-multi-spaces": ["error", {
        "exceptions": {
          "PropertyAssignment": false,
          "VariableDeclarator": false,
          "ImportDeclaration": false,
          "BinaryExpression": false
        }
      }],
      "no-multiple-empty-lines": "error",
      "no-native-reassign": "error",
      "no-nested-ternary": "error",
      "no-new-object": "warn",
      "no-return-assign": "error",
      "no-self-compare": "error",
      "no-sequences": "warn",
      "no-shadow-restricted-names": "error",
      "no-sparse-arrays": "error",
      "no-trailing-spaces": "error",
      "no-underscore-dangle": "error",
      "no-unexpected-multiline": "error",
      "no-unneeded-ternary": "warn",
      "no-unused-expressions": "error",
      "no-useless-call": "error",
      "no-useless-concat": "error",
      "no-useless-escape": "warn",
      "no-useless-return": "warn",
      "no-void": "error",
      "object-curly-spacing": ["error", "never"],
      "operator-linebreak": ["warn", "before", {
        "overrides": {
          "=": "after"
        }
      }],
      "quote-props": ["error", "as-needed"],
      "quotes": ["error", "single", {
        "avoidEscape": true
      }],
      "semi-spacing": "error",
      "semi": ["error", "always"],
      "space-before-blocks": ["error", "always"],
      "space-in-parens": ["error", "never"],
      "space-infix-ops": "error",
      "space-unary-ops": ["error", {
        "words": false, "nonwords": false
      }],
      "spaced-comment": ["warn", "always"],
      "valid-jsdoc": "off",
      "valid-typeof": "error",
      "yoda": ["error", "never"]
    }
  }]
}
module.exports = {
    "env": {
        "es2021": true,
        "node": true,
        "react-native/react-native": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:import/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "react-native"
    ],
    "ignorePatterns": [
        "android/",
        ".expo/",
        "node_modules/",
        "src/assets/",
    ],
    "rules": {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "no-unused-vars": "warn",
        "semi": ["error", "always"],
        "react-native/no-unused-styles": "warn",
        "react-native/no-single-element-style-arrays": "warn",
        'import/extensions': 'off',
        "import/no-unresolved": "off",
        "import/named": "off",
        "import/namespace": "off",
        "import/default": "off",
        "import/no-named-as-default-member": "off"
    },
    "settings": {
        "react": {
            "version": "detect"
        },
        "import/ignore": [
            "react-native"
        ],
        'import/resolver': {
            "node": {
                "extensions": ['.js', '.jsx', '.ts', '.tsx'],
            }
        },
    }
};

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
    "rules": {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "no-unused-vars": "warn",
        "semi": ["error", "always"],
        "react-native/no-unused-styles": "warn",
        "react-native/no-single-element-style-arrays": "warn",
        'import/extensions': 'off',
    },
    "settings": {
        "react": {
            "version": "detect"
        },
        "import/ignore": [
            "react-native"
        ],
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
        },
    }
};
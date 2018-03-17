module.exports = {
    'extends': 'google',
    "parser": "babel-eslint",
    'parserOptions': {
        'ecmaVersion': 6,
        'sourceType': 'module',
        'ecmaFeatures': {
            'jsx': true
        }
    },
    'env': {
        'node': true
    },
    'globals': {
        'Promise': true
    },
    'rules': {
        'no-dupe-class-members': 2,
        'no-dupe-keys': 2,
        'no-undef': 2,
        'comma-dangle': [2, 'never'],
        'max-len' : [2, {
            'code': 200
        }]
    }
};
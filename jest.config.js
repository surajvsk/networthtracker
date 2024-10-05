module.exports = {
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    "jest": {
    "reporters": [
        "default",
        "./path/to/your/reporter.js"  // Use the correct relative path
    ]
}
};
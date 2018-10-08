module.exports = {
    entry: __dirname + '/src/index.js',
    output: {
        path: __dirname + '/dist',
        publicPath: '/fraruca/webgl/trabajo/dist/',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: 'worker-loader'
            }, {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }],
        loaders: [
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    }
};
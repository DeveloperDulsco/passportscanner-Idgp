const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://qcscannerapi.saavy-pay.com:8082',
            changeOrigin: true,
            pathRewrite: {
                '^/api': '', 
            },
        })
    );
};

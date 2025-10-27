module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/order-callback',
            handler: 'order.callback',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/order-download',
            handler: 'order.download',
            config: {
                policies: [],
                middlewares: [],
            },
        }
    ]
}
module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/contact-us',
            handler: 'cms-page.contactUs',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ]
}
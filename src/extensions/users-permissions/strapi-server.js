module.exports = (plugin) => {
    // Create the new controller
    plugin.controllers.user.setEmail = async (ctx) => {
        const user = ctx.state.user;
        const { body } = ctx.request;

        // User has to be logged in to update email
        if (!user) {
            return ctx.unauthorized();
        }

        if (!user.email.includes('@steam.fake')) {
            return ctx.badRequest('Only users with initial email address can update their email!');
        }

        if (!body.email) {
            return ctx.badRequest('Email is required!');
        }

        try {
            await strapi.documents('plugin::users-permissions.user').update({
                documentId: user.documentId,
                data: {
                    email: body.email
                }
            });

            ctx.send({
                success: true
            });
        } catch (e) {
            ctx.send({
                success: false
            });
        }
    };
    plugin.controllers.user.setTradeUrl = async (ctx) => {
        const user = ctx.state.user;
        const { body } = ctx.request;

        // User has to be logged in to update email
        if (!user) {
            return ctx.unauthorized();
        }

        if (!body.tradeUrl) {
            return ctx.badRequest('Trade url is required!');
        }

        try {
            await strapi.documents('plugin::users-permissions.user').update({
                documentId: user.documentId,
                data: {
                    tradeUrl: body.tradeUrl
                }
            });

            ctx.send({
                success: true
            });
        } catch (e) {
            ctx.send({
                success: false
            });
        }
    };

    // Add the custom route
    plugin.routes['content-api'].routes.unshift({
        method: 'POST',
        path: '/users/email',
        handler: 'user.setEmail',
        config: {
            prefix: '',
        }
    });
    plugin.routes['content-api'].routes.unshift({
        method: 'POST',
        path: '/users/tradeUrl',
        handler: 'user.setTradeUrl',
        config: {
            prefix: '',
        }
    });

    return plugin;
};
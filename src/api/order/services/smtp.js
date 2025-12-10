const { MailtrapClient } = require("mailtrap");

const client = new MailtrapClient({
    token: process.env.MAILTRAP_API_TOKEN,
});

module.exports = () => ({
    sendEmail: async ({ to, sender, subject, body, replyTo }) => {
        try {
            await client.send({
                from: {
                    email: sender,
                    name: "The Cosmo Art Support"
                },
                to: [{ email: to }],
                subject,
                html: body,
                reply_to: replyTo,
            });
        } catch (error) {
            console.error('***', error);
        }
    }
})
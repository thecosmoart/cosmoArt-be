const smtp = require('@sendgrid/mail');

smtp.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = () => ({
    sendEmail: async ({ to, sender, subject, body, replyTo }) => {
        try {
            await smtp.send({
                from: sender,
                to: to,
                subject: subject,
                html: body,
                replyTo: replyTo ?? sender
            });
        } catch (error) {
            console.error('***', error);
            console.error('***', error.response.body);
        }
    }
})
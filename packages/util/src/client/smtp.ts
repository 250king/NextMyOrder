import nodemailer from "nodemailer";

const mail = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        await mail.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
};

export default sendEmail;

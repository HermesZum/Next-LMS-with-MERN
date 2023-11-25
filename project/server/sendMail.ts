import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

interface IMailOptions {
    email: string;
    subject: string;
    template: string;
    data: {[key: string]: any};
}

const sendMail = async (options: IMailOptions): Promise <void> => {
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_MAIL_HOST,
        port: Number(process.env.SMTP_MAIL_PORT || 587),
        service: process.env.SMTP_MAIL_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL_USERNAME,
            pass: process.env.SMTP_MAIL_PASSWORD
        }
    });

    const { email, subject, template, data } = options;

    const html = await ejs.renderFile(path.join(__dirname, `../mails/${template}`), data);

    const mailOptions = {
        from: process.env.SMTP_MAIL_FROM_ADDRESS,
        to: email,
        subject,
        html
    };

    await transporter.sendMail(mailOptions);
};

export default sendMail;
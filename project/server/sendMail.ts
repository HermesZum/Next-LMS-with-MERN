import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

/**
 * @interface IMailOptions
 * @description Interface for the mail options.
 * @property {string} email - The email address to send the mail to.
 * @property {string} subject - The subject of the email.
 * @property {string} template - The name of the ejs template to use for the email body.
 * @property {{ [key: string]: any; }} data - The data to pass to the ejs template.
 */
interface IMailOptions {
    email: string;
    subject: string;
    template: string;
    data: { [key: string]: any; };
}

/**
 * @function sendMail
 * @description Function to send an email using nodemailer and ejs for templating.
 * @param {IMailOptions} options - The mail options including email, subject, template, and data.
 * @returns {Promise<void>} - Returns a promise that resolves when the email has been sent.
 */
const sendMail = async (options: IMailOptions): Promise <void> => {
    // Create a nodemailer transporter using the SMTP settings from the environment variables.
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_MAIL_HOST,
        port: Number(process.env.SMTP_MAIL_PORT || 587),
        service: process.env.SMTP_MAIL_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL_USERNAME,
            pass: process.env.SMTP_MAIL_PASSWORD
        }
    });

    // Destructure the options parameter into individual variables.
    const { email, subject, template, data } = options;

    // Construct the path to the ejs template.
    const templatePath = path.join(__dirname, '../server/mails', template);

    // Render the ejs template with the provided data.
    const html = await ejs.renderFile(templatePath, data);

    // Set the sender name to the application name from the environment variables.
    process.env.SMTP_MAIL_FROM_NAME = process.env.APP_NAME;

    // Get the sender name from the environment variables, defaulting to 'Admin' if not set.
    const senderName = process.env.SMTP_MAIL_FROM_NAME || 'Admin';

    // Get the sender address from the environment variables.
    const senderAddress = process.env.SMTP_MAIL_FROM_ADDRESS;

    // Construct the mail options for nodemailer.
    const mailOptions = {
        from: `"${senderName}" <${senderAddress}>`,
        to: email,
        subject,
        html
    };

    // Send the email.
    await transporter.sendMail(mailOptions);
};

export default sendMail;
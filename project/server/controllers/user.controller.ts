import { Request, Response, NextFunction } from 'express';
import ErrorHandle from "../utils/ErrorHandle";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import userModel from "../models/user.model";
import * as jwt from 'jsonwebtoken';
import { Secret } from "jsonwebtoken";
import * as path from 'path';
import * as ejs from 'ejs';
import sendMail from "../sendMail";


// Load environment variables from a .env file into process.env
require ('dotenv').config();

/**
 * @interface IRegistrationBody
 * @description Interface for the user registration body.
 * @property {string} name - The name of the user.
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 * @property {string} [avatar] - The avatar of the user (optional).
 */
interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

/**
 * @function registerUser
 * @description Function to register a new user.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 */
export const registerUser = CatchAsyncError(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, email, password } = req.body;

        const isEmailExist = await userModel.findOne({ email });

        if (isEmailExist) {
            return next(new ErrorHandle("Email already exists.", 400));
        }

        const user:IRegistrationBody = {
            name,
            email,
            password
        };

        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;

        const data = { user: { name:user.name }, activationCode };
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);

        process.env.SMTP_MAIL_FROM_NAME = process.env.APP_NAME;
        const senderName = process.env.SMTP_MAIL_FROM_NAME || 'Admin';
        const senderAddress = process.env.SMTP_MAIL_FROM_ADDRESS;

        try {
            await sendMail({
                email: user.email,
                subject: 'Account Activation',
                template: 'activation-mail.ejs',
                data,
            });

            res.status(201).json({
                success: true,
                message: `An email has been sent to ${user.email}. Please check your email to activate your account.`,
                activationToken: activationToken.token,
            });
        }
        catch (error:any) {
            return next(new ErrorHandle(error.message, 400));
        }
    }
    catch (error:any) {
        return next(new ErrorHandle(error.message, 400));
    }
});

/**
 * @interface IActivationToken
 * @description Interface for the activation token.
 * @property {string} token - The JWT token.
 * @property {string} activationCode - The activation code.
 */
interface IActivationToken {
    token: string;
    activationCode: string;
}

/**
 * @function createActivationToken
 * @description Function to create an activation token for a user.
 * @param {any} user - The user object.
 * @returns {IActivationToken} - The activation token object.
 */
export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign(
        {
            user,
            activationCode,
        },
        process.env.JWT_ACTIVATION_SECRET as Secret,
        {
            expiresIn: '10m',
        }
    );

    return { token, activationCode };
}
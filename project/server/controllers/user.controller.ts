import { Request, Response, NextFunction } from 'express';
import ErrorHandle from "../utils/ErrorHandle";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import userModel, { IUser } from "../models/user.model";
import * as jwt from 'jsonwebtoken';
import { Secret } from "jsonwebtoken";
import * as path from 'path';
import * as ejs from 'ejs';
import sendMail from "../sendMail";
import { sendToken } from "../utils/jwt";


/**
 * @summary This line of code loads the environment variables from a .env file into process.env.
 * @description The dotenv module is used to load environment variables from a .env file into process.env.
 * This allows you to separate secrets from your source code.
 * This is useful in a development environment,
 * where you can set environment variables in your .env file
 * and not have to worry about setting them in the development environment.
 */
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

/**
 * @interface IActivationRequest
 * @description Interface for the activation request body.
 * @property {string} activation_token - The JWT token used for account activation.
 * @property {string} activation_code - The activation code sent to the user's email.
 */
interface IActivationRequest{
    activation_token: string;
    activation_code: string;
}


/**
 * @function activateUser
 * @description This function is used to activate a user's account.
 * It first verifies the activation token and code received from the request body.
 * If the verification is successful, it checks if the user already exists in the database using the email.
 * If the user does not exist, it creates a new user with the provided name, email, and password.
 * If the user creation is successful, it sends a response with a success message.
 * If any error occurs during this process, it passes the error to the next middleware function.
 * @param {Request} req - The request object, expected to contain the activation token and code in the body.
 * @param {Response} res - The response object, used to send the response to the client.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
export const activateUser = CatchAsyncError(async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        const { activation_token, activation_code } = req.body as IActivationRequest;

        const newUser: {user: IUser, activationCode: string} = jwt.verify(
            activation_token,
            process.env.JWT_ACTIVATION_SECRET as Secret
        ) as {user: IUser, activationCode: string};

        if(newUser.activationCode !== activation_code) {
            return next(new ErrorHandle("Invalid activation code.", 400));
        }

        const { name, email, password } = newUser.user;

        const existUser = await userModel.findOne({ email });

        if (existUser) {
            return next(new ErrorHandle("Email already exists.", 400));
        }

        const user = await userModel.create({
            name,
            email,
            password,
        });

        res.status(201).json({
            success: true,
            message: "Account has been activated.",
        });
    }
    catch (error:any) {
        return next(new ErrorHandle(error.message, 400));
    }
});

/**
 * @interface ILoginRequest
 * @summary This interface represents the request body for the login request.
 * @description It includes fields for the email and password of the user.
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 */
interface ILoginRequest {
    email: string;
    password: string;
}

/**
 * @function loginUser
 * @summary This function is used to authenticate a user.
 * @description It first extracts the email and password from the request body.
 * If either the email or password is missing, it sends an error response.
 * Then, it finds the user in the database using the email.
 * If the user is not found, it sends an error response.
 * If the user is found, it compares the provided password with the hashed password stored in the database.
 * If the passwords do not match, it sends an error response.
 * If the passwords match, it generates an access token and a refresh token for the user and sends them in the response.
 * @param {Request} req - The request object, expected to contain the email and password in the body.
 * @param {Response} res - The response object, used to send the response to the client.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
export const loginUser = CatchAsyncError(async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        const { email, password } = req.body as ILoginRequest;

        if (!email || !password) {
            return next(new ErrorHandle("Please enter email & password.", 400));
        }

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandle("Invalid credentials.", 401));
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            return next(new ErrorHandle("Invalid credentials.", 401));
        }

        sendToken(user, 200, res);
    }
    catch (error:any) {
        return next(new ErrorHandle(error.message, 400));
    }
});

/**
 * @function logoutUser
 * @summary This function is used to log out a user.
 * @description It clears the access token and refresh token cookies by setting them to null and their maxAge to 1 millisecond. Then, it sends a JSON response with the success status and a message indicating that the user has been logged out successfully. If any error occurs during this process, it passes the error to the next middleware function.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object, used to send the response to the client.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
export const logoutUser = CatchAsyncError(async ( req: Request, res: Response, next: NextFunction ) => {
    try {
        res.cookie('access_token', null, {
            maxAge: 1,
        });

        res.cookie('refresh_token', null, {
            maxAge: 1,
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    }
    catch (error:any) {
        return next(new ErrorHandle(error.message, 400));
    }
});
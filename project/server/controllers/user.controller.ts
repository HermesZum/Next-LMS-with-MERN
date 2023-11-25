import { Request, Response, NextFunction } from 'express';
import ErrorHandle from "../utils/ErrorHandle";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import userModel from "../models/user.model";
import * as jwt from 'jsonwebtoken';
import { Secret } from "jsonwebtoken";
import * as path from 'path';
import * as ejs from 'ejs';
import sendMail from "../sendMail";


require ('dotenv').config();

interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

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
        const data = { user:user.name, activationCode };
        const html = await ejs.renderFile(path.join(__dirname, '../mails/activation-mail.ejs'), data);

        try {
            await sendMail({
                email: user.email,
                subject: 'Account Activation',
                template: 'activation-mail.ejs',
                data,
            });

            res.status(200).json({
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

interface IActivationToken {
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000 + 1).toString();

    const token = jwt.sign(
        { user, activationCode },
        process.env.JWT_ACTIVATION_SECRET as Secret,
        { expiresIn: process.env.JWT_ACTIVATION_EXPIRES_TIME }
    );

    return { token, activationCode };
}
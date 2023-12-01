import {Response} from "express";
import {IUser} from "../models/user.model";
import {redis} from "./redis";

/**
 * @summary This line of code loads the environment variables from a .env file into process.env.
 * @description The dotenv module is used to load environment variables from a .env file into process.env.
 * This allows you to separate secrets from your source code.
 * This is useful in a development environment,
 * where you can set environment variables in your .env file
 * and not have to worry about setting them in the development environment.
 */
require('dotenv').config();

/**
 * @interface ITokenOptions
 * @summary This interface represents the options for the JWT tokens.
 * @description It includes fields for the expiry date, max age, httpOnly, sameSite, and secure options of the JWT tokens.
 * @property {Date} expires - The expiry date of the token.
 * @property {number} maxAge - The maximum age of the token.
 * @property {boolean} httpOnly - Whether the token is httpOnly.
 * @property {'lax' | 'strict' | 'none' | undefined} sameSite - The sameSite option of the token.
 * @property {boolean} secure - Whether the token is secure.
 */
interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

/**
 * @function sendToken
 * @summary This function is used to send JWT tokens to the client.
 * @description It generates an access token and a refresh token for the user, sets the options for the tokens, and sends them as cookies in the response. It also sends a JSON response with the success status, access token, and user data. Additionally, it stores the user data in Redis for session management.
 * @param {IUser} user - The user for whom the tokens are generated.
 * @param {number} statusCode - The status code of the response.
 * @param {Response} res - The response object.
 */
export const sendToken = ( user: IUser, statusCode: number, res: Response ) => {
    // Generate access and refresh tokens for the user
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    // Store the user data in Redis for session management
    redis.set(user._id, JSON.stringify(user as any));

    // Set the expiry times for the access and refresh tokens
    const accessTokenExpire = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES_TIME || '300', 10)
    const refreshTokenExpire = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_TIME || '1200', 10)

    // Set the options for the access token
    const accessTokenOptions: ITokenOptions = {
        expires: new Date(
            Date.now() + accessTokenExpire * 1000
        ),
        maxAge: accessTokenExpire * 1000,
        httpOnly: true,
        sameSite: 'lax'
    };

    // Set the options for the refresh token
    const refreshTokenOptions: ITokenOptions = {
        expires: new Date(
            Date.now() + refreshTokenExpire * 1000
        ),
        maxAge: refreshTokenExpire * 1000,
        httpOnly: true,
        sameSite: 'lax'
    };

    // If the environment is production, set the secure option for the access token
    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
    }

    // Send the access and refresh tokens as cookies in the response
    res.cookie('access_token', accessToken, accessTokenOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenOptions);

    // Send a JSON response with the success status, access token, and user data
    res.status(statusCode).json({
        success: true,
        accessToken,
        user
    });
}
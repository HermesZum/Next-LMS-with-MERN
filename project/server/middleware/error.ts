import ErrorHandle from "../utils/ErrorHandle";
import {NextFunction, Request, Response} from "express";

/**
 * @summary This is an Express middleware function for error handling.
 * It checks if the error object has a statusCode and message property, if not, it sets default values.
 * It then checks the name and code properties of the error object to determine the type of error.
 * If the error is a 'CastError', 'JsonWebTokenError', 'TokenExpiredError', or has a code of 11000,
 * it creates a new instance of the ErrorHandle class with a custom message and a status code of 400.
 * Finally, it sends a response to the client with the status code of the error and a JSON object.
 * The JSON object contains two properties: 'success' and 'message'.
 * The 'success' property is set to false, indicating that the request was not successful.
 * The 'message' property is set to the message of the error.
 */
export const ErrorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    /**
     * @summary Checks if the error object has a statusCode and message property, if not, it sets default values.
     */
    err.statusCode = err.statusCode || 500;

    /**
     * @summary Checks if the error object has a statusCode and message property, if not, it sets default values.
     */
    err.message = err.message || 'Internal Server Error';

    /**
     * @summary Checks if the error name is 'CastError'.
     * If it is, a new instance of the ErrorHandle class is created with a custom message and a status code of 400.
     * The ErrorHandle class is designed to handle custom errors in the application.
     * The new instance of ErrorHandle replaces the original error.
     */
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandle(message, 400);
    }

    /**
     * @summary Checks if the error code is 11000.
     * If it is, a new instance of the ErrorHandle class is created with a custom message and a status code of 400.
     * The ErrorHandle class is designed to handle custom errors in the application.
     * The new instance of ErrorHandle replaces the original error.
     */
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandle(message, 400);
    }

    /**
     * @summary Checks if the error name is 'JsonWebTokenError'.
     * If it is, a new instance of the ErrorHandle class is created with a custom message and a status code of 400.
     * The ErrorHandle class is designed to handle custom errors in the application.
     * The new instance of ErrorHandle replaces the original error.
     */
    if (err.name === 'JsonWebTokenError') {
        const message = `JSON Web Token is invalid. Try Again!!!`;
        err = new ErrorHandle(message, 400);
    }

    /**
     * @summary Checks if the error name is 'TokenExpiredError'.
     * If it is, a new instance of the ErrorHandle class is created with a custom message and a status code of 400.
     * The ErrorHandle class is designed to handle custom errors in the application.
     * The new instance of ErrorHandle replaces the original error.
     */
    if (err.name === 'TokenExpiredError') {
        const message = `JSON Web Token is expired. Try Again!!!`;
        err = new ErrorHandle(message, 400);
    }

    /**
     * @summary Sends a response to the client with the status code of the error and a JSON object.
     * The JSON object contains two properties: 'success' and 'message'.
     * The 'success' property is set to false, indicating that the request was not successful.
     * The 'message' property is set to the message of the error.
     */
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
}
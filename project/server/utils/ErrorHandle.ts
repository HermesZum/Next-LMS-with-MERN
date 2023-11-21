/**
 * @class ErrorHandle
 * @extends {Error}
 * @summary This class extends the built-in Error class in JavaScript.
 * It adds a statusCode property to the error, which can be used to indicate the HTTP status code associated with the error.
 * The constructor takes two parameters: message and statusCode.
 * The message parameter is passed to the parent Error class, and the statusCode is assigned to the statusCode property of the instance.
 * The Error.captureStackTrace method is used to create a stack trace for the error, which can be useful for debugging.
 */
class ErrorHandle extends Error {
    private readonly _statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this._statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }

    get statusCode() {
        return this._statusCode;
    }
}

export default ErrorHandle;
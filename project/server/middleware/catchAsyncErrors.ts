import { NextFunction, Request, Response } from "express";

/**
 * @summary Defines a type AsyncMiddleware that represents an Express middleware function that returns a Promise.
 */
type AsyncMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * @param fn
 * @constructor
 * @summary Defines a higher-order function CatchAsyncError that takes an AsyncMiddleware function as an argument and returns a new AsyncMiddleware function.
 * The returned function is an async function that executes the passed AsyncMiddleware function inside a try-catch block.
 * If the AsyncMiddleware function throws an error, the error is caught and passed to the next function.
 */
export const CatchAsyncError = (fn: AsyncMiddleware): AsyncMiddleware => {
    return async (
        req,
        res,
        next
    ) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
}
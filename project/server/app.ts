import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";

/**
 * @summary  Used to load environment variables from a .env file into the process.env object in Node.js.
 */
require('dotenv').config();

/**
 * @summary Exports the app variable using the export keyword,
 * which makes it available to other modules that import it.
 */
export const app = express();

/**
 * @summary Middleware function in the Express.js framework for Node.js,
 * used to parse incoming requests with JSON payloads,
 * the limit option allows you to specify the maximum size of the request body in bytes,
 * in this case, the limit is set to 50 megabytes
 */
app.use(express.json({limit: '50mb'}));

/**
 * @summary Used in the context of an Express.js application to enable CORS (Cross-Origin Resource Sharing).
 * CORS is a security feature implemented by web browsers that restricts a web page from making requests
 * to a different domain than the one that served the web page.
 */
app.use(cors({ origin: process.env.ORIGIN }));

/**
 * @summary Creates a new route
 * for GET requests to the /test endpoint
 * that sends a JSON response with a success property set to true and a message property set to 'API is working!'
 * when the endpoint is accessed.
 */
app.get('/test', (req:Request, res:Response, next:NextFunction) => {
    res.status(200).json({success: true, message: 'API is working!'});
});

/**
 * @summary this function acts as a catch-all for any requests made to routes that have not been defined in the application.
 * It creates a new error indicating that the requested route does not exist,
 * assigns a status code of 404 to the error, and passes it along to the next middleware function.
 * This is typically an error-handling middleware where the error would be processed
 * and an appropriate response would be sent to the client.
 */
app.all('*', (req:Request, res:Response, next:NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} does not exist`) as any;
    err.statusCode = 404;
    next(err);
});

/**
 * @summary Adds the ErrorMiddleware function to the middleware stack of the Express application.
 * The ErrorMiddleware function is designed to handle errors that occur while processing the request.
 */
app.use(ErrorMiddleware);
/**
 * @file This file defines the routes for user-related operations.
 */

// Importing the necessary modules
import * as express from "express";
import { registerUser } from "../controllers/user.controller";

// Creating a new router object
const userRouter = express.Router();

/**
 * @route POST /registration
 * @description This route is used to register a new user.
 * @access Public
 */
userRouter.post('/registration', registerUser);

// Exporting the router object
export default userRouter;
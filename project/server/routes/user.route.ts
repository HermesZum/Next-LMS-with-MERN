/**
 * @file This file defines the routes for user-related operations.
 */

// Importing the necessary modules
import * as express from "express";
import {activateUser, loginUser, logoutUser, registerUser} from "../controllers/user.controller";

// Creating a new router object
const userRouter = express.Router();

/**
 * @route POST /registration
 * @description This route is used to register a new user.
 * @access Public
 */
userRouter.post('/registration', registerUser);

/**
 * @route POST /activation
 * @description This route is used to activate a user's account.
 * The activation function is expected to handle the logic of verifying the user's account,
 * such as checking an activation token.
 * @access Public
 */
userRouter.post('/activation', activateUser);

/**
 * @route POST /login
 * @description This route is used to authenticate a user.
 * The loginUser function is expected to handle the logic of user authentication,
 * such as checking the user's credentials and generating JWT tokens.
 * @access Public
 */
userRouter.post('/login', loginUser);

/**
 * @route GET /logout
 * @description This route is used to log out a user.
 * The logoutUser function is expected to handle the logic of user logout, such as clearing the JWT tokens.
 * @access Public
 */
userRouter.get('/logout', logoutUser);

// Exporting the router object
export default userRouter;
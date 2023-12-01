/**
 * @summary This code defines a User model for a MongoDB database using Mongoose and TypeScript.
 * It includes fields for user information, a method for password comparison,
 * and a pre-save hook for password hashing.
 */

import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, {Secret} from 'jsonwebtoken';

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
 * @summary This regex pattern is used to validate the email field.
 */
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @interface IUser
 * @summary This interface extends the Document object from Mongoose and represents a User document in the MongoDB database.
 * @description It includes fields for user information such as name, email, password, avatar, role, isVerified, and courses.
 * It also includes methods for password comparison and JWT generation.
 * @property {string} name - The name of the user.
 * @property {string} email - The email of the user.
 * @property {string} password - The password of the user.
 * @property {Object} avatar - The avatar of the user, including a public_id and url.
 * @property {string} role - The role of the user.
 * @property {boolean} isVerified - Whether the user is verified.
 * @property {Array<{ courseId: string }>} courses - The courses the user is enrolled in.
 * @method comparePassword - A method that takes a password as a parameter and returns a Promise that resolves to a boolean value indicating whether the provided password matches the hashed password stored in the database.
 * @method SignAccessToken - A method that generates a JWT (JSON Web Token) for the user.
 * @method SignRefreshToken - A method that generates a refresh JWT for the user.
 */
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    }
    role: string;
    isVerified: boolean;
    courses: Array<{ courseId: string }>;
    comparePassword(password: string): Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
}

/**
 * @summary This is the UserSchema object in Mongoose.
 * @description This schema defines the structure of the User document in the MongoDB database.
 * It includes fields for user information such as name, email, password, avatar, role, isVerified, and courses.
 * Each field has its own properties like type, required, and validated.
 * The 'timestamps' option is set to true to automatically manage createdAt and updatedAt properties.
 */
const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, "Please enter your name." ]
    },
    email: {
        type: String,
        required: [true, "Please enter your email." ],
        validate: {
            validator: (email: string) => emailRegexPattern.test(email),
            message: "Please enter a valid email address."
        },
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please enter your password." ],
        minlength: [6, "Password must be at least 6 characters long." ],
        select: false
    },
    avatar: {
        public_id: String,
        url: String
    },
    role: {
        type: String,
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    courses: [
        {
            courseId: String,
        }
    ]
}, { timestamps: true });

/**
 * @summary This pre-save hook hashes the password before saving it to the database.
 * @description This function is triggered before the save operation on the UserSchema object in Mongoose.
 * If the password field is not modified, it proceeds to the next middleware.
 * If the password field is modified,
 * it hashes the password using bcrypt's hash method with a salt of 10 rounds
 * and assigns the hashed password back to the password field.
 * Then it proceeds to the next middleware.
 * @param {function} next - The next middleware function to execute.
 */
UserSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

/**
 * @method SignAccessToken
 * @summary This method is part of the UserSchema object in Mongoose.
 * It's used to generate a JWT (JSON Web Token) for the user.
 * @description The JWT is signed with the user's ID (`this._id`) and a secret key (`process.env.ACCESS_TOKEN`).
 * The secret key is retrieved from the environment variables.
 * If the `ACCESS_TOKEN` environment variable is not set, an empty string is used as the fallback.
 * The generated token can be used for user authentication in the application.
 * @returns {string} The generated JWT for the user.
 */
UserSchema.methods.SignAccessToken = function(): string {
    return jwt.sign({ id: this._id }, process.env.JWT_ACCESS_TOKEN as Secret || "" );
};

/**
 * @method SignRefreshToken
 * @summary This method is part of the UserSchema object in Mongoose. It's used to generate a refresh JWT (JSON Web Token) for the user.
 * @description The refresh JWT is signed with the user's ID (`this._id`) and a secret key (`process.env.REFRESH_TOKEN`). The secret key is retrieved from the environment variables. If the `REFRESH_TOKEN` environment variable is not set, an empty string is used as the fallback. The generated refresh token can be used for refreshing the user's authentication in the application.
 * @returns {string} The generated refresh JWT for the user.
 */
UserSchema.methods.SignRefreshToken = function(): string {
    return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_TOKEN as Secret || "" );
};

/**
 * @method comparePassword
 * @summary This method is part of the UserSchema object in Mongoose.
 * It's used to compare the provided password with the user's hashed password.
 * @description The method takes a password as a parameter
 * and uses bcrypt's compare method to check if the provided password matches the hashed password stored in the database.
 * It returns a Promise that resolves to a boolean value indicating whether the passwords match.
 * @param {string} password - The password to compare with the user's hashed password.
 * @returns {Promise<boolean>} A Promise that resolves to a boolean value indicating whether the passwords match.
 */
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

/**
 * @summary The model is created from the UserSchema schema and exported
 */
export default mongoose.model<IUser>('User', UserSchema);
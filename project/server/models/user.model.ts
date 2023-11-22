/**
 * @summary This code defines a User model for a MongoDB database using Mongoose and TypeScript.
 * It includes fields for user information, a method for password comparison,
 * and a pre-save hook for password hashing.
 */

import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @summary This regex pattern is used to validate the email field.
 */
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @summary This interface defines the User model.
 */
interface IUser extends Document {
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
}

/**
 * @summary This interface defines the User model static methods.
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
 */
UserSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

/**
 * @summary This method compares the password entered by the user with the hashed password stored in the database.
 * @param password
 */
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

/**
 * @summary The model is created from the UserSchema schema and exported
 */
export default mongoose.model<IUser>('User', UserSchema);
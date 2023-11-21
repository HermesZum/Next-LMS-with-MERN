import mongoose from 'mongoose';

/**
 * @summary  Used to load environment variables from a .env file into the process.env object in Node.js.
 */
require ('dotenv').config();

/**
 * @Summary This line of code declares a constant variable 'dbUrl' of type string.
 * It assigns the value of the environment variable 'DB_URL' to 'dbUrl'.
 * If 'DB_URL' is not defined or falsy, it assigns an empty string to 'dbUrl'.
 */
const dbUrl:string = process.env.DB_URL || '';

/**
 * @summary This function connects to the MongoDB database using the Mongoose library.
 * It uses the dbUrl variable to connect to the database.
 * The connectDB function is called in the app.ts file.
 */
const connectDB = async () => {
    try {
        // Await for the connection promise and log the host name of the database to the console.
        await mongoose.connect(dbUrl).then((data:any) => {
            console.log(`Database connected with ${data.connection.host}`);
        });
    } catch (error:any) {
        // If the connection fails, log the error message to the console and try again after 5 seconds.
        if (error instanceof Error) {
            console.log(error.message);
        }
        setTimeout(connectDB, 5000);
    }
}
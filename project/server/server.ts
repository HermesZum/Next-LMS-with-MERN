import {app} from './app';
import connectDB from "./utils/db";

/**
 * @summary  Used to load environment variables from a .env file into the process.env object in Node.js.
 */
require ('dotenv').config();

/**
 * @summary Start the server and listen for incoming requests on the specified port.
 */
app.listen(process.env.PORT, () => {
    // Log a message to the console when the server is ready to accept requests.
    console.log(`Listening on port ${process.env.PORT}`);
    // Connect to the database.
    connectDB().then(error => console.log(error));
});
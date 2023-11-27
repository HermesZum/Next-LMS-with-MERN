import {app} from './app';
import connectDB from "./utils/db";

/**
 * @summary  Used to load environment variables from a .env file into the process.env object in Node.js.
 */
require ('dotenv').config();

// Set the port for the server to listen on.
// The port number is retrieved from the environment variables.
// If the PORT environment variable is not set, it defaults to 3000.
const port = Number(process.env.PORT) || 3000;

/**
 * @summary Start the server and listen for incoming requests on the specified port.
 */
app.listen(port, '127.0.0.1',() => {
    // Log a message to the console when the server is ready to accept requests.
    console.log(`Listening on port ${ port }`);
    // Connect to the database.
    connectDB().then(error => console.log(error));
});
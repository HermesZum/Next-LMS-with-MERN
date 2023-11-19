import {app} from './app';
require ('dotenv').config();

// This is the entry point for the server.
app.listen(process.env.PORT, () => { console.log(`Listening on port ${process.env.PORT}`); });
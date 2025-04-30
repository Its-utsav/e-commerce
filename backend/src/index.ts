import "dotenv/config";
// import * as env from "dotenv";
// // env.config({
//     path: ".env",
// });
import app from "./app";
import connectDB from "./db";
const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(
                `DB connected and server srated http://localhost:${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error("Something gone wrong " + error);
    });

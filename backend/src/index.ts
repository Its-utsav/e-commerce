import * as env from "dotenv";
import app from "./app";
import connectDB from "./db";
env.config({
    path: ".env",
});
const PORT = process.env.PORT || 3000;

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

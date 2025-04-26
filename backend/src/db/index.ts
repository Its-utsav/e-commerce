import mongoose, { connect } from "mongoose";

const connectDB = async () => {
    try {
        const url = process.env.MONGODB_URI;
        if (url != undefined) {
            const dbConnection = await connect(url, {
                dbName: "e-commerce",
            });

            console.log(
                `DB Connected successfully ${dbConnection.connection.host}`
            );
        }
    } catch (error: unknown) {
        if (error instanceof mongoose.Error) {
            console.error(`DB Connection failed ${error.message}`);
        } else if (error instanceof Error) {
            console.error(`DB Connection failed ${error.message}`);
        }
        process.exit(1);
    }
};

export default connectDB;

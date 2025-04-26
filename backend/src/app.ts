import express from "express";
import globalErrorHandler from "./utils/globalError";
const app = express();

app.use(
    express.json({
        limit: "20kb",
    })
);

app.use(
    express.urlencoded({
        limit: "20kb",
    })
);

// ROUTES



// GLOBAL ERROR Handling
app.use(globalErrorHandler)

export default app;

import express from "express";
import globalErrorHandler from "./utils/globalError";
import { PREFIX_URL } from "./constants";
const app = express();

app.use(
    express.json({
        limit: "20kb",
    })
);

app.use(
    express.urlencoded({
        limit: "20kb",
        extended: true,
    })
);

// ROUTES
import userRoutes from "./routes/user.routes";
import productRouets from "./routes/product.routes";

// ROUTES uses
app.use(`${PREFIX_URL}/auth`, userRoutes);
app.use(`${PREFIX_URL}/products`, productRouets);

// GLOBAL ERROR Handling
app.use(globalErrorHandler);

export default app;

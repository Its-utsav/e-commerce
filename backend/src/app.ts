import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import { PREFIX_URL } from "./constants";
import globalErrorHandler from "./utils/globalError";

const app = express();

app.use(morgan("dev"));

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

app.use(cookieParser());

// ROUTES
import adminRoutes from "./routes/admin.routes";
import cartRoutes from "./routes/cart.routes";
import merchantRoutes from "./routes/merchant.routes";
import orderRoutes from "./routes/order.routes";
import productRouets from "./routes/product.routes";
import userRoutes from "./routes/user.routes";

// ROUTES uses
app.use(`${PREFIX_URL}/auth`, userRoutes);
app.use(`${PREFIX_URL}/products`, productRouets);
app.use(`${PREFIX_URL}/merchant`, merchantRoutes);
app.use(`${PREFIX_URL}/carts`, cartRoutes);
app.use(`${PREFIX_URL}/orders`, orderRoutes);
app.use(`${PREFIX_URL}/admin`, adminRoutes);

// GLOBAL ERROR Handling
app.use(globalErrorHandler);

export default app;

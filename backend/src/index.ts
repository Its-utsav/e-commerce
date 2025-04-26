import express, { Request, Response } from "express";
const app = express();

app.get("/", (req: Request, res: Response) => {
    return res.json({
        msg: "LOl",
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT}`);
});

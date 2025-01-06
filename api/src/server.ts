import express, {Express, Request, Response} from "express";
import generate from "./routes/generate";
const app: Express = express();

app.use(express.json());

app.use("/generate", generate);

app.listen(3000, () => {
    console.log("Listening at port 3000!");
});
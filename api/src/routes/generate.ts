import express, { Request, Response, Router } from "express";
import * as dotenv from "dotenv";
const router: Router = express.Router();
import { validateBoardSize } from "../middleware/validateBoardSize";
import { getBoard, postBoard } from "../controllers/generateController";

dotenv.config();

console.log(process.env.DB_CONNECTION_STRING);

// returns a random board of size n from the database.
router.get("/", validateBoardSize, getBoard);

// generates a board and adds it to the database.
router.post("/", validateBoardSize, postBoard);

export default router;

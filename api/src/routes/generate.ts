import express, {Request, Response, Router} from "express";
import * as dotenv from "dotenv"
const router: Router = express.Router();
import { collections } from "../services/database.service";
import { validateBoardSize } from "../middleware/validateBoardSize";

dotenv.config();

console.log(process.env.DB_CONNECTION_STRING);

import {generateValidBoardRuleBased } from "shared";

// returns a random board of size n from the database.
router.get('/', validateBoardSize, async (req: Request, res: Response) => {
    const size = req.query?.size as string | undefined;

    const pipeline = [
        {$match: {size: parseInt(size!)}},
        {$sample: {size: 1}}
    ]

    const boardDocument = (await collections.boards?.aggregate(pipeline).toArray())

    if (boardDocument?.length) {
        const boardData = boardDocument[0].board as number[][];
        res.status(200).json(boardData);
    } else {
        res.status(404).json({"message": "board not found"});
    }
});

// generates a board and adds it to the database.
router.post('/', validateBoardSize, async (req: Request, res: Response) => {
    const size = req.query?.size as string | undefined;
    const boardSize = parseInt(size!);

    const board = generateValidBoardRuleBased(boardSize);
    collections.boards?.insertOne({size: boardSize, board: board});

    res.status(200).json(board);
})

// get: should return a random board of size n from the database

// post: takes the size and color map, adds it to the appropriate collection

export default router;

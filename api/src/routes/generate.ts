import express, {Request, Response, Router} from "express";
import * as dotenv from "dotenv"
const router: Router = express.Router();
import { collections } from "../services/database.service";

dotenv.config();

console.log(process.env.DB_CONNECTION_STRING);

import { boardType, generateValidBoardRuleBased } from "shared";

router.use(express.json())

router.get('/', async (req: Request, res: Response) => {
    const size = req.query?.size as string | undefined;
    if (!size) {
        return res.status(400).json({"message": "please specify the board size."});
    }

    const boardSize = parseInt(size as string);
    if (boardSize < 4 || boardSize > 10) {
        return res.status(400).json({"message": "board size must be between 4 and 10"});
    }

    const pipeline = [
        {$match: {size: boardSize}},
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

router.post('/', async (req: Request, res: Response) => {
    const size = req.query?.size as string | undefined;
    if (!size) {
        return res.status(400).json({"message": "please specify the board size."});
    }

    const boardSize = parseInt(size as string);
    if (boardSize < 4 || boardSize > 10) {
        return res.status(400).json({"message": "board size must be between 4 and 10"});
    }

    const board = generateValidBoardRuleBased(boardSize);
    collections.boards?.insertOne({size: boardSize, board: board});

    res.status(200).json(board);
})

// get: should return a random board of size n from the database

// post: takes the size and color map, adds it to the appropriate collection

export default router;

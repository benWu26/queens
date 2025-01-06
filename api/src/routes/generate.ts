import express, {Request, Response, Router} from "express";
const router: Router = express.Router();

import { generateValidBoardRuleBased } from "../controllers/BoardGenerator";

router.get('/', (req: Request, res: Response) => {
    const size = req.query?.size as string | undefined;
    if (!size) {
        return res.status(400).json({"message": "please specify the board size."});
    }

    const boardSize = parseInt(size as string);
    if (boardSize < 4 || boardSize > 10) {
        return res.status(400).json({"message": "board size must be between 4 and 10"});
    }

    const board = generateValidBoardRuleBased(boardSize);
    res.status(200).json(board);
});

export default router;

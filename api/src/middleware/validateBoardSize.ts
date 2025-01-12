import express, {RequestHandler} from "express"

// express middleware for validating the size of a board
export const validateBoardSize: RequestHandler = (req, res, next) => {
    const size = req.query?.size as string | undefined;
    if (!size) {
        return res.status(400).json({"message": "please specify the board size."});
    }

    const boardSize = parseInt(size as string);
    if (boardSize < 4 || boardSize > 10) {
        return res.status(400).json({"message": "board size must be between 4 and 10"});
    }

    next();
}
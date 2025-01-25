import express, {RequestHandler} from "express"
import type {Context, APIGatewayProxyStructuredResultV2, APIGatewayProxyEvent, Handler} from "aws-lambda";


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

export const validateBoardSize2: Handler = async (_event: APIGatewayProxyEvent, _context: Context) => {
    const sizeStr = _event.queryStringParameters?.size as string | undefined;
    if (!sizeStr) {
        return {
            statusCode: 400,
            body: "please specify the board size"
        }
    };

    const boardSize = parseInt(sizeStr as string);
    if (boardSize < 4 || boardSize > 10) {
        return {
            statusCode: 400,
            body: "board size must be between 4 and 10"
        }
    }
}
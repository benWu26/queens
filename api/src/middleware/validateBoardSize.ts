import type {Context, APIGatewayProxyStructuredResultV2, APIGatewayProxyEvent, Handler} from "aws-lambda";

declare module "aws-lambda" {
    interface Context {
        end(): void;
    }
}

export const validateBoardSize: Handler = async (_event: APIGatewayProxyEvent, _context: Context) => {

    const sizeStr = _event.queryStringParameters?.size as string | undefined;
    if (!sizeStr) {
        console.log("blah blah")
        _context.end();
        return {
            statusCode: 400,
            body: "please specify the board size"
        }
    };

    const boardSize = parseInt(sizeStr as string);
    if (boardSize < 4 || boardSize > 10) {
        _context.end();
        return {
            statusCode: 400,
            body: "board size must be between 4 and 10"
        }
    }
}
import {Request, Response} from "express";
import { collections, connectToDatabase } from "../services/database.service";
import { generateValidBoardRuleBased } from "shared";
import { Binary } from "mongodb";

import type {
    Context,
    APIGatewayProxyStructuredResultV2,
    APIGatewayProxyEventV2,
    Handler
} from "aws-lambda"

/**
 * Packs a color map (a 2D array of numbers) into a byte array, where each
 * pair of numbers is packed into a single byte. The first number of the pair
 * is shifted 4 bits left and combined with the second number of the pair using
 * a bitwise OR.
 *
 * @param {number[][]} board - the color map to pack. values can be from 0 to 15
 * @returns {Uint8Array} the packed byte array
 */
const packColorMapToBytes = (board: number[][]): Uint8Array => {
    const bytes: number[] = [];
    const integers = board.flat();
    for (let i = 0; i < integers.length; i += 2) {
        const high = integers[i] << 4; // Shift high nibble
        const low = integers[i + 1] ?? 0; // Low nibble, default to 0
        bytes.push(high | low); // Combine high and low nibbles
    }

    return new Uint8Array(bytes);
}

/**
 * Decodes the given bytes into a color map. The bytes are expected to be an array of packed color values
 * where each color value is stored in a single byte, with the high nibble representing the first color value
 * and the low nibble representing the second color value. The size parameter is the size of the board
 * that the color map is for.
 *
 * @param {number[]} bytes the bytes to decode
 * @param {number} size the size of the board
 * @returns {number[][]} the decoded color map
 */
const decodeBytesIntoColorMap = (bytes: number[], size: number): number[][] => {
    const flatColors: number[] = []

    for (let i = 0; i < bytes.length; i++) {
        const high = bytes[i] >> 4 & 0xf;
        const low = bytes[i] & 0xf;
        flatColors.push(high, low);
    }

    // if the board size is odd, the number of cells will be odd, so we get rid of the last one
    if (size & 0x1) {
        flatColors.pop();
    }

    console.log(flatColors);

    const colorMap: number[][] = [];
    
    while (flatColors.length) {
        colorMap.push(flatColors.splice(0, size));
    }

    return colorMap;
}





export const getBoard: Handler = async (
    _event: APIGatewayProxyEventV2,
    _context: Context
): Promise<APIGatewayProxyStructuredResultV2> => {
    await connectToDatabase();
    const sizeStr = _event.queryStringParameters?.size as string | undefined;
    const percentileString = _event.queryStringParameters?.percentile as string | undefined;
    const boardSize = parseInt(sizeStr!);

    const getPercentilePipeline = [
        {$match: {size: boardSize}},
        {$group: {
            _id: null,
            difficulty_percentile: {
                $percentile: {
                    input: "$difficulty",
                    p: [parseFloat(percentileString!) + (Math.random() * 0.1 - 0.05)],
                    method: "approximate"
                }
            }
        }}
    ]

    const percentileDoc = (await collections.boards?.aggregate(getPercentilePipeline).toArray());

    const targetDifficulty = percentileDoc![0].difficulty_percentile[0]
    console.log(targetDifficulty);

    const getPuzzlePipeline = [
        {$match: {size: boardSize, difficulty: targetDifficulty}},
        {$sample: {size: 1}}
    ]

    const boardDocument = (await collections.boards?.aggregate(getPuzzlePipeline).toArray());

    if (boardDocument?.length) {
        const boardData = boardDocument[0].board.buffer;
        return {
            statusCode: 200,
            body: JSON.stringify(decodeBytesIntoColorMap(boardData, boardSize))
        }
    } else {
        return {
            statusCode: 404,
            body: "board not found"
        }
    }
}

export const postBoard: Handler = async (_event: APIGatewayProxyEventV2, _context: Context) => {
    await connectToDatabase();
    const sizeString = _event.queryStringParameters?.size as string | undefined;
    const boardSize = parseInt(sizeString!);

    const board = generateValidBoardRuleBased(boardSize);
    
    collections.boards?.insertOne({size: boardSize, difficulty: board.difficulty, board: new Binary(packColorMapToBytes(board.board))});

    return {
        statusCode: 200,
        body: "board successfully created"
    }
}
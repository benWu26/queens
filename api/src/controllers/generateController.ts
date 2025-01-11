import express, {Request, Response, Router} from "express";
import { collections } from "../services/database.service";
import { generateValidBoardRuleBased } from "shared";
import { Binary } from "mongodb";

const packIntegersToBytes = (integers: number[]): Uint8Array => {
    const bytes: number[] = [];
    for (let i = 0; i < integers.length; i += 2) {
        const high = integers[i] << 4; // Shift high nibble
        const low = integers[i + 1] ?? 0; // Low nibble, default to 0
        bytes.push(high | low); // Combine high and low nibbles
    }

    return new Uint8Array(bytes);
}

const decodeBytesIntoColorMap = (bytes: number[], size: number): number[][] => {
    const flatColors: number[] = []

    for (let i = 0; i < bytes.length; i++) {
        const high = bytes[i] >> 4 & 0xf;
        const low = bytes[i] & 0xf;
        flatColors.push(high, low);
    }

    if (size & 0x1) {
        flatColors.pop();
    }

    console.log(flatColors);

    const colorMap: number[][] = []

    while (flatColors.length) {
        colorMap.push(flatColors.splice(0, size));
    }

    return colorMap;
}

export const getBoard = async (req: Request, res: Response) => {
    const size = req.query?.size as string | undefined;
    const boardSize = parseInt(size!);

    const pipeline = [
        {$match: {size: boardSize}},
        {$sample: {size: 1}}
    ]

    const boardDocument = (await collections.boards?.aggregate(pipeline).toArray())

    if (boardDocument?.length) {
        const boardData = boardDocument[0].board.buffer;
        res.status(200).json(decodeBytesIntoColorMap(boardData, boardSize));
    } else {
        res.status(404).json({"message": "board not found"});
    }
}

export const postBoard = async (req: Request, res: Response) => {
    const size = req.query?.size as string | undefined;
    const boardSize = parseInt(size!);

    const board = generateValidBoardRuleBased(boardSize);

    const flatBoard = board.flat();
    
    collections.boards?.insertOne({size: boardSize, board: new Binary(packIntegersToBytes(flatBoard))});

    res.status(200).json({message: "board successfully created"})
}


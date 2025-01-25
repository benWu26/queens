import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: {boards?: mongoDB.Collection} = {}

let isConnected = false;

// connects to the MongoDB database using the connection string.
export async function connectToDatabase() {
    if (isConnected) return;

    dotenv.config();

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONNECTION_STRING!);

    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    const boardsCollection: mongoDB.Collection = db.collection(process.env.COLLECTION_NAME!);

    collections.boards = boardsCollection;

    isConnected = true;
    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${boardsCollection.collectionName}`);
}
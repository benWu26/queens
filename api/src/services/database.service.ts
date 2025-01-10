import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: {boards?: mongoDB.Collection} = {}

export async function connectToDatabase() {
    dotenv.config();

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONNECTION_STRING!);

    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    const boardsCollection: mongoDB.Collection = db.collection(process.env.COLLECTION_NAME!);

    collections.boards = boardsCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${boardsCollection.collectionName}`);
}
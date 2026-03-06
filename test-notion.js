import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function checkSchema() {
    try {
        console.log("Fetching database items for ID:", databaseId);
        const query = await notion.databases.query({ database_id: databaseId });
        console.log(`Found ${query.results.length} items.`);

        if (query.results.length > 0) {
            console.log("--- First Item Properties Structure ---");
            console.log(JSON.stringify(query.results[0].properties, null, 2));
        } else {
            console.log("The database is currently empty.");
        }
    } catch (error) {
        console.error("Error connecting to Notion:", error);
    }
}

checkSchema();

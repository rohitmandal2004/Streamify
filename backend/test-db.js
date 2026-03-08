import { MongoClient } from 'mongodb';
import 'dotenv/config';

async function test() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("❌ MONGO_URI is not defined in .env");
        process.exit(1);
    }
    
    console.log("Testing URI:", uri.replace(/\/\/.*:.*@/, "//****:****@"));
    
    const client = new MongoClient(uri);
    try {
        console.log("Attempting to connect...");
        await client.connect();
        console.log("✅ Successfully connected to MongoDB Atlas!");
        const databases = await client.db().admin().listDatabases();
        console.log("Available databases:", databases.databases.map(d => d.name));
    } catch (err) {
        console.error("❌ Connection failed:");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.codeName) console.error("Code Name:", err.codeName);
        if (err.stack) console.error("Stack Trace:", err.stack);
    } finally {
        await client.close();
    }
}

test();

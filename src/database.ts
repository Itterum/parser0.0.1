import { MongoClient } from 'mongodb'
import { IBaseEntity } from './baseEntity'
import dotenv from 'dotenv'

dotenv.config()

const mongoUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/`
const dbName = process.env.DATABASE_NAME || ""

export async function connectToMongoDB(mongoUri: string): Promise<MongoClient> {
    const client = new MongoClient(mongoUri)
    await client.connect()
    return client
}

export async function saveDataToMongoDB<T extends IBaseEntity>(data: T[], entityType: string) {
    const connection = await connectToMongoDB(mongoUri)

    try {
        const database = connection.db(dbName)
        const collection = database.collection(entityType)
        await collection.createIndexes([
            { key: { 'collected.date': 1 } }
        ])
        await collection.insertMany(data)

    } catch (error) {
        console.error('Error saving data to MongoDB:', error)
    } finally {
        await connection.close()
    }
}
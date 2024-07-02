import { MongoClient } from 'mongodb'
import { IBaseEntity } from './baseEntity'

export async function connectToMongoDB(mongoUri: string): Promise<MongoClient> {
    const client = new MongoClient(mongoUri)
    await client.connect()
    return client
}

export async function saveDataToMongoDB<T extends IBaseEntity>(data: T[], entityType: string, mongoUri: string, dbName: string) {
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
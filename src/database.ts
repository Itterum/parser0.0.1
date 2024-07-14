import {MongoClient} from 'mongodb';
import {IBaseEntity} from './baseEntity';
import dotenv from 'dotenv';
import {getExtractors} from './utils';

dotenv.config();

export default class Database {

    public dbName = process.env.DATABASE_NAME || '';

    public async connect() {
        const client = new MongoClient(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/`);
        await client.connect();
        return client;
    }

    public async disconnect(client: MongoClient) {
        await client.close();
    }

    public async saveData<T extends IBaseEntity>(data: T[], entityType: string) {
        const connection = await this.connect();
        try {
            const database = connection.db(this.dbName);
            const collection = database.collection(entityType);
            await collection.createIndexes([
                {key: {'collected.date': 1}},
            ]);
            await collection.insertMany(data);
        } catch (error) {
            console.error('Error saving data to MongoDB:', error);
        } finally {
            await this.disconnect(connection);
        }
    }

    public async saveExtractors() {
        const connection = await this.connect();

        try {
            const extractors = await getExtractors();
            if (!extractors) {
                console.error('No extractors found.');
                return;
            }

            const database = connection.db(this.dbName);
            const collection = database.collection('extractors');

            for (const {name, path} of extractors) {
                const existingExtractor = await collection.findOne({name});

                if (existingExtractor) {
                    if (existingExtractor.path !== path) {
                        await collection.updateOne({_id: existingExtractor._id}, {$set: {path}});
                        console.log(`Updated path for extractor ${name}`);
                    } else {
                        console.log(`Extractor ${name} already exists in the database.`);
                    }
                } else {
                    await collection.insertOne({name, path});
                    console.log(`Added new extractor ${name}`);
                }
            }
        } catch (error) {
            console.error('Error saving data to MongoDB:', error);
        } finally {
            await this.disconnect(connection);
        }
    }

    public async getExtractors() {
        const connection = await this.connect();
        try {
            const database = connection.db(this.dbName);
            const collection = database.collection('extractors');
            return await collection.find({}).toArray();
        } catch (error) {
            console.error('Error getting extractors from MongoDB:', error);
        } finally {
            await this.disconnect(connection);

        }
    }
}

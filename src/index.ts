import Fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import dotenv from 'dotenv';
import Database from './database';
import Runner from './runner';

dotenv.config();

const database = new Database();

const app: FastifyInstance = Fastify({logger: true});
const host = process.env.APP_HOST || 'localhost';
const port = Number(process.env.APP_PORT) || 3000;

app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send('Fastify + TypeScript Server!');
});

app.get('/api/extractors', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const extractorNames = await database.getExtractors();

        reply.send(extractorNames);
    } catch (err) {
        app.log.error(err);
        reply.status(500).send('Error reading directory');
    }
});

app.post('/api/extractors', async (request: FastifyRequest, reply: FastifyReply) => {
    const {urls, extractorName} = request.body as { urls: string[], extractorName: string };

    if (!urls || !extractorName) {
        reply.status(400).send('Missing urls or extractor name');
    }

    const runner = new Runner();

    try {
        await runner.run(urls, extractorName);
        reply.status(200).send('Extractor run successfully');
    } catch (err) {
        app.log.error(err);
        reply.status(500).send('Error running extractor');
    }
});

(async () => {
    try {
        await database.saveExtractors();
        console.log('Extractors saved to MongoDB successfully.');

        app.listen({port, host}, (err, address) => {
            if (err) {
                app.log.error(err);
                process.exit(1);
            }
            app.log.info(`⚡️[server]: Server is running at ${address}`);
        });
    } catch (error) {
        console.error('Error during server initialization:', error);
        process.exit(1);
    }
})();

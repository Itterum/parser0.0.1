import Fastify, {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import dotenv from 'dotenv'
import * as fs from 'fs'
import path from 'path'
import {runExtractor} from './utils'

dotenv.config()

const app: FastifyInstance = Fastify({logger: true})
const host = process.env.APP_HOST || 'localhost'
const port = Number(process.env.APP_PORT) || 3000

app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send('Fastify + TypeScript Server!')
})

app.get('/api/extractors', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const files = await fs.promises.readdir('./dist/extractors')
        const extractorNames = files
            .filter(file => !file.startsWith('baseExtractor') && file.endsWith('.js'))
            .map(file => path.parse(file).name)

        reply.send(extractorNames)
    } catch (err) {
        app.log.error(err)
        reply.status(500).send('Error reading directory')
    }
})

app.post('/api/extractors', async (request: FastifyRequest, reply: FastifyReply) => {
    const {urls, extractorName} = request.body as { urls: string[], extractorName: string }

    if (!urls || !extractorName) {
        reply.status(400).send('Missing urls or extractor name')
    }

    try {
        const extractorPath = path.join(__dirname, `../dist/extractors/${extractorName}`)
        const extractor = require(extractorPath)
        const extractorInstance = new extractor.default()
        await runExtractor(urls, extractorInstance, extractorName)
        reply.status(200).send('Extractor run successfully')
    } catch (err) {
        app.log.error(err)
        reply.status(500).send('Error running extractor')
    }
})

app.listen({port, host}, (err, address) => {
    if (err) {
        app.log.error(err)
        process.exit(1)
    }
    app.log.info(`⚡️[server]: Server is running at ${address}`)
})

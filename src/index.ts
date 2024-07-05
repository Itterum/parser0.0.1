import express, {Express, Request, Response} from 'express'
import dotenv from 'dotenv'
import * as fs from 'fs'
import path from 'path'
import {runExtractor} from './utils'

dotenv.config()

const app: Express = express()
const host = process.env.APP_HOST || 'localhost'
const port = process.env.APP_PORT || 3000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server')
})

app.get('/api/extractors', (req: Request, res: Response) => {
    fs.readdir('./dist/extractors', (err, files) => {
        if (err) {
            console.error(err)
            res.status(500).send('Error reading directory')
            return
        }

        const extractorNames = files.map(file => {
            return path.parse(file).name
        })

        res.send(extractorNames)
    })
})

app.post('/api/extractors', async (req: Request, res: Response) => {
    console.log('Received request body:', req.body)
    const urls = req.body.urls
    const extractorName = req.body.extractor

    if (!urls || !extractorName) {
        return res.status(400).send('Missing urls or extractor name')
    }

    try {
        const extractorPath = path.join(__dirname, `../dist/extractors/${extractorName}`)
        const extractor = require(extractorPath)
        const extractorInstance = new extractor.default()
        await runExtractor(urls, extractorInstance, extractorName)
        res.status(200).send('Extractor run successfully')
    } catch (err) {
        console.error(err)
        res.status(500).send('Error running extractor')
    }
})

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://${host}:${port}`)
})

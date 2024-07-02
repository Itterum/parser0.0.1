import { BaseExtractor } from './baseExtractor'
import { BaseEntity } from './baseEntity'
import { GitHubExtractor } from './githubTrending'
import { HiTechExtractor } from './hi-tech'
import dotenv from 'dotenv'

dotenv.config()

const mongoUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:${process.env.DB_PORT}/`
const dbName = process.env.DATABASE_NAME || ""

async function runExtractor<T extends BaseEntity>(urls: string[], extractor: BaseExtractor<T>, entityType: string): Promise<void> {
    let data: T[] = []

    for (const url of urls) {
        const result = await extractor.parsePage(url)
        data.push(...result)
    }

    try {
        for (const entity of data) {
            await entity.save(mongoUri, dbName, entityType)
        }
    } catch (err) {
        console.error('Error:', err)
    } finally {
        console.log('Data saved successfully')
    }
}

async function main() {
    const github = new GitHubExtractor()
    await runExtractor(['https://github.com/trending'], github, 'GitHubRepositories')

    const hitech = new HiTechExtractor()
    await runExtractor(['https://hi-tech.md/kompyuternaya-tehnika/tovary-apple/iphone/'], hitech, 'HiTechProduct')
}

main()

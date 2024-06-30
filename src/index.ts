import { BaseExtractor, IBaseEntity } from './baseExtractor'
// import { GitHubExtractor } from './githubTrending'
import { HiTechExtractor } from './hi-tech'
import { saveDataToMongoDB } from './utils'
import dotenv from 'dotenv'

dotenv.config()

const mongoUri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:27017/`
const dbName = 'testdb'

async function runExtractor<T extends IBaseEntity>(urls: string[], extractor: BaseExtractor<T>, entityType: string): Promise<void> {
    let data: T[] = []

    for (const url of urls) {
        const result = await extractor.parsePage(url)
        data.push(...result)
    }

    try {
        await saveDataToMongoDB(data, entityType, mongoUri, dbName)
    } catch (err) {
        console.error('Error:', err)
    } finally {
        console.log('Data saved successfully')
    }
}

async function main() {
    // const github = new GitHubExtractor()
    // await runExtractor(['https://github.com/trending'], github, 'GitHubRepositories')

    const hitech = new HiTechExtractor()
    await runExtractor(['https://hi-tech.md/kompyuternaya-tehnika/tovary-apple/iphone/'], hitech, 'HiTechProduct')
}

main()

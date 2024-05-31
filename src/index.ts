import * as fs from 'fs'
import * as path from 'path'
import { BaseExtractor } from './baseExtractor'
import { GitHubExtractor } from './githubTrending'
import { HiTechExtractor } from './hi-tech'

async function saveDataToFile<T>(data: T[], entityType: string, outputDir: string) {
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0]
    const dirPath = path.join(outputDir, dateStr, entityType)
    const filePath = path.join(dirPath, `${dateStr}.json`)

    fs.mkdirSync(dirPath, { recursive: true })

    if (fs.existsSync(filePath)) {
        const existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        existingData.push(...data)
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8')
    } else {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    }
}

async function runExtractor<T>(urls: string[], extractor: BaseExtractor<T>, entityType: string, outputDir: string): Promise<void> {
    let data: T[] = []

    if (urls.length > 1) {
        for (const url of urls) {
            const result = await extractor.parsePage(url)
            data.push(...result)
        }
    } else {
        data = await extractor.parsePage(urls[0])
    }

    await saveDataToFile(data, entityType, outputDir)
}

async function main() {
    const outputDir = './data'
    const github = new GitHubExtractor()
    await runExtractor(['https://github.com/trending'], github, 'GitHubRepositories', outputDir)

    const hitech = new HiTechExtractor()
    await runExtractor(['https://hi-tech.md/kompyuternaya-tehnika/tovary-apple/macbook/'], hitech, 'HiTechProduct', outputDir)
}

main()

import { CentrsvyaziExtractorCategory, CentrsvyaziExtractorCard, ProductCard } from './centrsvyazi'
import { indexData } from './elastic'
import { Worker, isMainThread, workerData } from 'worker_threads'

async function parseCategory(urls: string[]) {
    const centrsvyaziCategory = new CentrsvyaziExtractorCategory()

    return await centrsvyaziCategory.parsePage(urls[0])
}

async function parseCard(urls: ProductCard[]) {
    const centrsvyaziCard = new CentrsvyaziExtractorCard()

    for (let i = 0; i < urls.length; i++) {
        const product = urls[i]

        try {
            const entities = await centrsvyaziCard.parsePage(product.url)
            await indexData('products', '_doc', entities[0])
        } catch (error) {
            console.error('Error processing product:', error)
        }
    }
}

async function main() {
    if (isMainThread) {
        const urls = await parseCategory(['https://centrsvyazi.ru/catalog/phones'])

        const numWorkers = 5
        const urlsPerWorker = Math.ceil(urls.length / numWorkers)

        for (let i = 0; i < numWorkers; i++) {
            const start = i * urlsPerWorker
            const end = start + urlsPerWorker
            const workerUrls = urls.slice(start, end)

            const worker = new Worker(__filename, { workerData: { urls: workerUrls } })
            worker.on('error', (error) => console.error('Worker error:', error))
            worker.on('exit', (code) => console.info(`Worker exited with code ${code}`))
        }
    } else {
        const { urls } = workerData
        await parseCard(urls)
    }    
}

main().then(r => console.log(r))

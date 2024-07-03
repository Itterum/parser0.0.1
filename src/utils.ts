import axios from "axios"
import { BaseEntity } from './baseEntity'
import { BaseExtractor } from './extractors/baseExtractor'

export async function checkHealthProxies(url: string, proxy: string): Promise<boolean | undefined> {
    try {
        const response = await axios.get(url, {
            proxy: {
                host: proxy.split(':')[0],
                port: parseInt(proxy.split(':')[1])
            },
            timeout: 5000
        })

        return response.status === 200
    } catch (error: any) {
        console.error("Error checking URL with proxy:", error.message)
    }
}

export async function getRandomProxy(): Promise<string> {
    const headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)"
    }

    const reqOptions = {
        url: "",
        method: "GET",
        headers: headersList,
    }

    const response = await axios.request(reqOptions)

    const randomProxy = response.data.data.sort(() => 0.5 - Math.random())[0]

    return `${randomProxy.protocols[0]}://${randomProxy.ip}:${randomProxy.port}`
}
export async function runExtractor<T extends BaseEntity>(urls: string[], extractor: BaseExtractor<T>, entityType: string): Promise<void> {
    let data: T[] = []

    for (const url of urls) {
        const result = await extractor.parsePage(url)
        data.push(...result)
    }

    try {
        for (const entity of data) {
            await entity.save(entityType)
        }
    } catch (err) {
        console.error('Error:', err)
    } finally {
        console.log('Data saved successfully')
    }
}

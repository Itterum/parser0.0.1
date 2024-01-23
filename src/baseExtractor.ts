import * as cheerio from 'cheerio'
import { chromium, Page } from "playwright"

export abstract class BaseExtractor<T> {
    abstract waitSelector: string
    abstract domain: string

    abstract parseEntity($: cheerio.CheerioAPI, page?: Page): T

    async parsePage(url: string): Promise<T[]> {
        const browser = await chromium.launch()
        const page = await browser.newPage()

        try {
            await page.goto(url)
            await page.waitForSelector(this.waitSelector)

            const entities = await page.$$(this.waitSelector)

            const result = await Promise.all(entities.map(async (element) => {
                const html = await element.innerHTML()
                const $ = cheerio.load(html)

                return this.parseEntity($, page)
            }))

            return result
        } catch (error) {
            console.error(error)
            return []
        } finally {
            await browser.close()
        }
    }
}
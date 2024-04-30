import * as cheerio from 'cheerio'
import { chromium, Page } from 'playwright'

export abstract class BaseExtractor<T> {
    abstract waitSelector: string
    abstract domain: string

    abstract parseEntity($: cheerio.CheerioAPI, page?: Page): T

    async scrollToEnd(page: Page): Promise<void> {
        await page.evaluate(() => {
            const maxScrollAttempts = 10
            let currentScrollAttempt = 0

            function checkScrollEnd() {
                currentScrollAttempt++
                if (currentScrollAttempt >= maxScrollAttempts) {
                    return
                }

                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
                const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight

                if (scrollTop === scrollHeight) {
                    return
                }

                window.scrollTo(0, scrollHeight)
                requestAnimationFrame(checkScrollEnd)
            }

            checkScrollEnd()
        })
    }

    async logRequests(page: Page, proxy: string): Promise<void> {
        page.on('request', (request) => {
            const requestInfo = {
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                proxyUsed: proxy,
            }

            console.log('Request Info:', requestInfo)
        })
    }

    async parsePage(url: string): Promise<T[]> {
        // const browser = await chromium.connectOverCDP('http://localhost:9222')
        const browser = await chromium.launch()
        // const defaultContext = browser.contexts()[0]
        const page = await browser.newPage()

        try {
            await this.logRequests(page, '')
            await page.goto(url)
            await page.waitForSelector(this.waitSelector)

            await this.scrollToEnd(page)

            const entities = await page.$$(this.waitSelector)

            return await Promise.all(entities.map(async (element) => {
                const html = await element.innerHTML()
                const $ = cheerio.load(html)

                return this.parseEntity($, page)
            }))
        } catch (error) {
            console.error(error)
            return []
        } finally {
            await page.close()
            await browser.close()
        }
    }
}
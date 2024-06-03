import { chromium, ElementHandle, Page } from 'playwright'
import { checkHealthProxies, getRandomProxy } from './utils'

export interface IBaseEntity {
    fields: {
        [key: string]: string | number
    }
    collected: {
        date: string
    }
}

export class BaseEntity implements IBaseEntity {
    fields: {
        [key: string]: string | number
    }
    collected: {
        date: string
    }

    constructor(fields: { [key: string]: string | number }) {
        this.fields = fields
        const date = new Date()
        const timezone = 'Europe/Moscow'
        const options = { timeZone: timezone, hour12: false }
        this.collected = {
            date: date.toLocaleString('en-GB', {
                ...options,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).replace(/\//g, '-')
        }
    }
}

export interface IExtractor<T> {
    waitSelector: string
    domain: string
    pager?: string

    scrollToEnd(page: Page): Promise<void>
    logRequests(page: Page, proxy: string): Promise<void>
    parseEntity(element: ElementHandle): Promise<T>
    parsePage(url: string): Promise<T[]>
}

export abstract class BaseExtractor<T> implements IExtractor<T> {
    abstract waitSelector: string
    abstract domain: string
    pager?: string
    endPage?: string

    async scrollToEnd(page: Page): Promise<void> {
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

        for (let i = 0;i < 10;i++) {
            const previousHeight = await page.evaluate('document.body.scrollHeight')
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
            await delay(2000)
            const newHeight = await page.evaluate('document.body.scrollHeight')
            if (newHeight === previousHeight) break
        }
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

    abstract parseEntity(element: ElementHandle): Promise<T>

    async parsePage(url: string): Promise<T[]> {
        // let proxy = await getRandomProxy()

        const launchOptions = {
            headless: false,
            // proxy: {
            //     server: proxy,
            // },
        }

        // const browser = await chromium.connectOverCDP('http://localhost:9222')
        const browser = await chromium.launch(launchOptions)
        // const defaultContext = browser.contexts()[0]
        const page = await browser.newPage()

        await page.route(/(png|jpeg|jpg|svg)$/, route => route.abort())

        try {
            // await this.logRequests(page, proxy)
            await page.goto(url)
            // await page.waitForTimeout(60000)
            await page.waitForSelector(this.waitSelector)

            await this.scrollToEnd(page)

            const items: T[] = []

            while (true) {
                if (this.pager) {
                    await page.getByRole('link', { name: new RegExp(`^${this.pager}`, 'i') }).click()
                }

                await this.scrollToEnd(page)

                const allProductsShown = await page.$(`${this.endPage}`)
                if (allProductsShown) {
                    break
                }
            }

            const elements = await page.$$(this.waitSelector)

            for (const element of elements) {
                const item = await this.parseEntity(element)
                items.push(item)
            }

            return items
        } catch (error) {
            console.error(error)
            return []
        } finally {
            await page.close()
            await browser.close()
        }
    }
}

import { chromium, ElementHandle, Page } from 'playwright'

export interface IExtractor<T> {
    waitSelector: string
    domain: string
    pager?: {
        start?: string,
        end: string,
    }

    scrollToEnd(page: Page): Promise<void>

    logRequests(page: Page, proxy: string): Promise<void>

    parseEntity(element: ElementHandle): Promise<T>

    parsePage(url: string): Promise<T[]>
}

export abstract class BaseExtractor<T> implements IExtractor<T> {
    abstract waitSelector: string
    abstract domain: string
    pager?: {
        start?: string,
        end: string,
    }

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
        const launchOptions = {
            headless: true,
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
                if (this.pager?.start) {
                    await page.getByRole('link', { name: new RegExp(`^${this.pager.start}`, 'i') }).click()
                }

                await this.scrollToEnd(page)

                const allProductsShown = await page.$(`${this.pager?.end}`)
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

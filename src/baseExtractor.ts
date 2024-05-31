import { chromium, ElementHandle, Page } from 'playwright'
import { checkHealthProxies, getRandomProxy } from './utils'

export interface IExtractor<T> {
    waitSelector: string
    domain: string

    scrollToEnd(page: Page): Promise<void>
    logRequests(page: Page, proxy: string): Promise<void>
    parseEntity(element: ElementHandle, page?: Page): Promise<T>
    parsePage(url: string): Promise<T[]>
}

export abstract class BaseExtractor<T> implements IExtractor<T> {
    abstract waitSelector: string
    abstract domain: string

    async scrollToEnd(page: Page): Promise<void> {
        await page.evaluate(`() => {
            const maxScrollAttempts = 10
            let currentScrollAttempt = 0

            const checkScrollEnd = () => {
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
        }`)
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

    abstract parseEntity(element: ElementHandle, page?: Page): Promise<T>

    async parsePage(url: string): Promise<T[]> {
        // let proxy = await getRandomProxy()

        const launchOptions = {
            // headless: false,
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

            // await this.scrollToEnd(page)

            const entities = await page.$$(this.waitSelector)

            return await Promise.all(entities.map(async (element) => {
                return this.parseEntity(element)
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

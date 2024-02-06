import * as cheerio from 'cheerio'
import {chromium, Page} from "playwright"
import {getRandomProxy} from './utils'

export abstract class BaseExtractor<T> {
    abstract waitSelector: string
    abstract domain: string

    abstract parseEntity($: cheerio.CheerioAPI, page?: Page): T

    async scrollToEnd(page: Page): Promise<void> {
        await page.evaluate(() => {
            return new Promise<void>((resolve) => {
                const maxScrollAttempts = 10;
                let currentScrollAttempt = 0;

                function checkScrollEnd() {
                    currentScrollAttempt++;
                    if (currentScrollAttempt >= maxScrollAttempts) {
                        resolve();
                    } else {
                        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

                        if (scrollTop === scrollHeight) {
                            resolve();
                        } else {
                            window.scrollTo(0, document.body.scrollHeight);
                            setTimeout(checkScrollEnd, 1000);
                        }
                    }
                }

                checkScrollEnd();
            });
        });
    }

    async logRequests(page: Page, proxy: string): Promise<void> {
        page.on('request', (request) => {
            console.log(`Request URL: ${request.url()}`);
            console.log(`Request Method: ${request.method()}`);
            console.log(`Request Headers: ${JSON.stringify(request.headers())}`);
            console.log(`Request Post Data: ${request.postData()}`);
            console.log(`Proxy Used: ${proxy}`);
        });
    }

    async parsePage(url: string): Promise<T[]> {
        const proxy = getRandomProxy()
        const browser = await chromium.launch({ proxy })
        const page = await browser.newPage()

        try {
            await this.logRequests(page, proxy.server);

            await page.goto(url, { timeout: 30000 })
            await page.waitForSelector(this.waitSelector)

            await this.scrollToEnd(page);

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
            await browser.close()
        }
    }
}
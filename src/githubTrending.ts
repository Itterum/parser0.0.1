import { BaseExtractor } from './baseExtractor'

type Repository = {
    title: string
    url: string
    description: string
    language: string
    countAllStars: number
    countStarsToday: number
    countForks: number
}

export class GitHubExtractor extends BaseExtractor<Repository> {
    domain = 'github.com'
    waitSelector = '.Box-row'

    async parseEntity(element: any): Promise<Repository> {
        const title = await element.$('.h3')
        const url = await element.$('.h3 > a')
        const description = await element.$('.col-9')
        const language = await element.$('[itemprop="programmingLanguage"]')
        const countAllStars = await element.$('a.Link[href$="/stargazers"]')
        const countStarsToday = await element.$('span.d-inline-block.float-sm-right')
        const countForks = await element.$('a.Link[href$="/forks"]')

        return {
            title: (await title.textContent()).trim().replace(/\s+/g, ' '),
            url: new URL(await url.getAttribute('href'), `https://${this.domain}`).href,
            description: (await description?.textContent())?.trim() || null,
            language: (await language?.textContent())?.trim(),
            countAllStars: parseInt((await countAllStars.textContent())?.trim().replace(',', '')),
            countStarsToday: parseInt((await countStarsToday.textContent())?.trim().replace(',', '')),
            countForks: parseInt((await countForks.textContent())?.trim().replace(',', '')),
        }
    }
}

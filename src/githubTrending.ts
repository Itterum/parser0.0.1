import { CheerioAPI } from "cheerio"
import { BaseExtractor } from "./baseExtractor"

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
    domain = 'https://github.com'
    waitSelector = '.Box-row'

    parseEntity($: CheerioAPI): Repository {
        return {
            title: $('.h3').text().trim().replace(/\s+/g, ' ') || '',
            url: new URL(($('.h3 > a').attr('href') || ''), this.domain).href,
            description: $('.col-9').text().trim() || '',
            language: $('.d-inline-block').find('[itemprop="programmingLanguage"]').text().trim() || '',
            countAllStars: parseInt($('a.Link[href$="/stargazers"]').text().replace(',', '')) || 0,
            countStarsToday: parseInt($('span.d-inline-block.float-sm-right').text().replace(',', '')) || 0,
            countForks: parseInt($('a.Link[href$="/forks"]').text().replace(',', '')) || 0,
        }
    }
}

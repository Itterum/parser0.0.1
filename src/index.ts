import { BaseExtractor } from './baseExtractor'
import { GitHubExtractor } from './githubTrending'
import { MaklerExtractor } from './hi-tech'

async function runExtractor<T>(urls: string[], extractor: BaseExtractor<T> ): Promise<T[] | T> {
    if (urls.length > 1) {
        for (const url of urls) {
            return extractor.parsePage(url)
        }
    }

    return extractor.parsePage(urls[0])
}

async function main() {
    // const github = new GitHubExtractor()
    // const repositories = await parseGitHub(['https://github.com/trending'], github)
    // console.log(repositories)
    
    const makler = new MaklerExtractor()
    const apartments = await runExtractor(['https://hi-tech.md/kompyuternaya-tehnika/tovary-apple/macbook/'], makler)
    console.log(apartments)
}

main()

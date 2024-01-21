import { CentrsvyaziExtractor } from './centrsvyazi'
import { GitHubExtractor } from './githubTrending'

async function runExtractors(urls: string[]) {
    const github = new GitHubExtractor()
    const centrsvyazi = new CentrsvyaziExtractor()

    console.log(await centrsvyazi.parsePage(urls[0]))
    console.log(await github.parsePage(urls[1]))
}

const urls = [
    'https://centrsvyazi.ru/catalog/phones/apple',
    'https://github.com/trending'
]

runExtractors(urls);

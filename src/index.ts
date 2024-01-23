import { CentrsvyaziExtractorCategory, CentrsvyaziExtractorCard } from './centrsvyazi'
// import { GitHubExtractor } from './githubTrending'

async function runExtractors(urls: string[]) {
    // const github = new GitHubExtractor()
    const centrsvyaziCategory = new CentrsvyaziExtractorCategory()
    const centrsvyaziCard = new CentrsvyaziExtractorCard()

    const categoryProducts = await centrsvyaziCategory.parsePage(urls[0])

    console.log('Category products:')
    console.log(categoryProducts)

    console.log('Card products:')
    for (const product of categoryProducts) {
        console.log(await centrsvyaziCard.parsePage(product.url))
    }
}

const urls = [
    'https://centrsvyazi.ru/catalog/phones/apple',
    'https://github.com/trending'
]

runExtractors(urls);

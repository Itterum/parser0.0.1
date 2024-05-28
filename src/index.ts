import { GitHubExtractor } from './githubTrending'

async function parseGitHub(urls: string[]) {
    const github = new GitHubExtractor()

    if (urls.length > 1) {
        for (const url of urls) {
            return github.parsePage(url)
        }
    }

    return github.parsePage(urls[0])
}

async function main() {
    const repositories = await parseGitHub(['https://github.com/trending'])
    console.log(repositories)
}

main()

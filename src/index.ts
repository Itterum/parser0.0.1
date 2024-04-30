import { GitHubExtractor } from './githubTrending'

async function parseGitHub(urls: string[]) {
    const github = new GitHubExtractor()

    return await github.parsePage(urls[0])
}

async function main() {
    const repositories = await parseGitHub(['https://github.com/trending'])

    repositories.forEach((repository: any) => console.log(repository))
}

main()

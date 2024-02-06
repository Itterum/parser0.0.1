import { proxies } from "./proxies"

export function getRandomProxy() {
    return { 'server': `https://${proxies.sort(() => { return 0.5 - Math.random() })[0]}` }
}

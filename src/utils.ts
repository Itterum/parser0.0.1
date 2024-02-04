import { proxies } from "./proxies"

export function getRandomProxy() {
    return { 'server': `http://${proxies.sort(() => { return 0.5 - Math.random() })[0]}` }
}

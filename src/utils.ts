import { proxies } from './proxies'

export function getRandomProxy() {
    const randomProxy = proxies.sort(() => 0.5 - Math.random())[0]

    return {
        'server': `${randomProxy.protocols[0]}://${randomProxy.ip}:${randomProxy.port}`
    }
}

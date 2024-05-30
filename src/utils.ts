import { proxies } from './proxies'

export async function getRandomProxy() {
    let headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)"
    }

    let response = await fetch("https://proxylist.geonode.com/api/proxy-list?limit=500&page=1&sort_by=lastChecked&sort_type=desc", {
        method: "GET",
        headers: headersList
    })

    let data = await response.json()

    const randomProxy = data.data.sort(() => 0.5 - Math.random())[0]

    return {
        'server': `${randomProxy.protocols[0]}://${randomProxy.ip}:${randomProxy.port}`
    }
}

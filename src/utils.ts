import axios from "axios"

export async function checkHealthProxies(url: string, proxy: string): Promise<boolean> {
    try {
        const response = await axios.get(url, {
            proxy: {
                host: proxy.split(':')[0],
                port: parseInt(proxy.split(':')[1])
            },
            timeout: 5000
        })
        return response.status === 200
    } catch (error: any) {
        console.error("Error checking URL with proxy:", error.message)
        return false
    }
}

export async function getRandomProxy() {
    let headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)"
    }

    let reqOptions = {
        url: "https://proxylist.geonode.com/api/proxy-list?protocols=http%2Chttps&limit=500&page=1&sort_by=lastChecked&sort_type=desc",
        method: "GET",
        headers: headersList,
    }

    let response = await axios.request(reqOptions)

    const randomProxy = response.data.data.sort(() => 0.5 - Math.random())[0]

    return `${randomProxy.protocols[0]}://${randomProxy.ip}:${randomProxy.port}`
}

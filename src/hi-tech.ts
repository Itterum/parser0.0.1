import { BaseExtractor } from './baseExtractor'
import { ElementHandle } from 'playwright'

type Product = {
    title: string
    price: number
    currency: string
    url: string
}

export class MaklerExtractor extends BaseExtractor<Product> {
    domain = 'hi-tech.md'
    waitSelector = '.ypi-grid-list__item_body'

    async parseEntity(element: ElementHandle): Promise<Product> {
        const title = await element.$('.ty-grid-list__item-name')
        let priceText = await element.$('.ty-price')
        const url = await element.$('.ty-grid-list__item-name > bdi > a')

        const priceRes = await priceText?.textContent()
        const match = priceRes?.match(/^([\d\s]+)(\D+)$/)

        return {
            title: (await title?.textContent())?.trim().replace(/\s+/g, ' ') || '',
            price: parseInt(match ? match[1].replace(/\s+/g, '') : '') || 0,
            currency: match ? match[2].trim() : '',
            url: await url?.getAttribute('href') || ''
        }
    }
}

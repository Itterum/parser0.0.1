import { BaseExtractor } from './baseExtractor'

type Apartments = {
    title: string
    price: number
    currency: string
    url: string
}

export class MaklerExtractor extends BaseExtractor<Apartments> {
    domain = 'hi-tech.md'
    waitSelector = '.ypi-grid-list__item_body'

    async parseEntity(element: any): Promise<Apartments> {
        const title = await element.$('.ty-grid-list__item-name')
        let priceText = await element.$('.ty-price')
        const url = await element.$('.ty-grid-list__item-name > bdi > a')

        priceText = await priceText.textContent()
        const match = priceText.match(/^([\d\s]+)(\D+)$/)

        return {
            title: (await title.textContent()).trim().replace(/\s+/g, ' '),
            price: match[1].replace(/\s+/g, ''),
            currency: match[2].trim(),
            url: await url.getAttribute('href')
        }
    }
}

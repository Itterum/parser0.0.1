import { BaseExtractor } from './baseExtractor'
import { BaseEntity } from '../baseEntity'
import { ElementHandle } from 'playwright'

class ProductEntity extends BaseEntity { }

export default class HiTechExtractor extends BaseExtractor<ProductEntity> {
    domain = 'hi-tech.md'
    waitSelector = '.ypi-grid-list__item_body'
    pager = {
        start: 'Показать ещё',
        end: '.already-showing-all-products',
    }

    async parseEntity(element: ElementHandle): Promise<ProductEntity> {
        const title = await element.$('.ty-grid-list__item-name')
        const priceText = await element.$('.ty-price')
        const url = await element.$('.ty-grid-list__item-name > bdi > a')

        const priceRes = await priceText?.textContent()
        const match = priceRes?.match(/^([\d\s]+)(\D+)$/)

        return new ProductEntity({
            title: (await title?.textContent())?.trim().replace(/\s+/g, ' ') || '',
            price: parseInt(match ? match[1].replace(/\s+/g, '') : '') || 0,
            currency: match ? match[2].trim() : '',
            url: await url?.getAttribute('href') || '',
        })
    }
}

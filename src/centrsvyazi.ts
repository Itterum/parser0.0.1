import { CheerioAPI } from "cheerio"
import { BaseExtractor } from "./baseExtractor"

type Price = {
    value: number
    currency: string
}

type Product = {
    name: string
    newPrice: Price
    oldPrice: Price
    image: string
    url: string
}

export class CentrsvyaziExtractor extends BaseExtractor<Product> {
    domain = 'https://centrsvyazi.ru'
    waitSelector = '.products .product-item'

    parseEntity($: CheerioAPI): Product {
        const newPriceText = $('.price_cart > .doubleprice > .newprice').text().trim() || $('.price').text() || ''

        const [newValue, newCurrency] = newPriceText.split(/\s+/)
        const newPrice = {
            value: parseFloat(newValue),
            currency: newCurrency,
        }

        const oldPriceText = $('.price_cart > .doubleprice > .oldprice').text().trim() || ''

        const [oldValue, oldCurrency] = oldPriceText.split(/\s+/)
        const oldPrice = {
            value: parseFloat(oldValue),
            currency: oldCurrency,
        }

        return {
            name: $('.product_link > h3').text().trim() || '',
            newPrice,
            oldPrice,
            image: new URL(($('.product-image').attr('style')?.match(/url\(['"]?(.*?)['"]?\)/)?.[1].replace('micro_img', 'medium_img') || ''), this.domain).href,
            url: new URL(($('.product_link').attr('href') || ''), this.domain).href,
        }
    }
}

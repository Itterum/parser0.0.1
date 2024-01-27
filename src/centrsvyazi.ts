import { CheerioAPI } from "cheerio"
import { BaseExtractor } from "./baseExtractor"
import { Page } from "playwright"

type Price = {
    value: number
    currency: string
}

interface ProductCommon {
    name: string
    newPrice: Price
    oldPrice: Price
    image: string
    url: string
}

export type ProductCategory = ProductCommon

export type ProductCard = ProductCommon & {
    brand: string
}

export class CentrsvyaziExtractorCategory extends BaseExtractor<ProductCategory> {
    domain = 'https://centrsvyazi.ru'
    waitSelector = '.products .product-item'

    parseEntity($: CheerioAPI): ProductCategory {
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
            image: new URL(($('.product-image').attr('style')?.match(/url\(['"]?(.*?)['"]?\)/)?.[1].replace('micro_img', 'big_img') || ''), this.domain).href,
            url: new URL(($('.product_link').attr('href') || ''), this.domain).href,
        }
    }
}

export class CentrsvyaziExtractorCard extends BaseExtractor<ProductCard> {
    domain = 'https://centrsvyazi.ru'
    waitSelector = '.content-page'

    parseEntity($: CheerioAPI, page: Page): ProductCard {
        const newPriceText = $('.price > .newprice').text().trim() || $('.price').text().trim() || ''

        const [newValue, newCurrency] = newPriceText.split(/\s+/)
        const newPrice = {
            value: parseFloat(newValue),
            currency: newCurrency,
        }

        const oldPriceText = $('.price > .oldprice').text().trim() || ''

        const [oldValue, oldCurrency] = oldPriceText.split(/\s+/)
        const oldPrice = {
            value: parseFloat(oldValue),
            currency: oldCurrency,
        }

        return {
            name: $('.product-title').text().trim().replace(/\s+/g, ' ') || '',
            brand: $('#brand_name').text().trim() || '',
            newPrice,
            oldPrice,
            image: new URL(($('.slick-track > div').attr('style')?.match(/url\(['"]?(.*?)['"]?\)/)?.[1].replace('medium_img', 'big_img') || ''), this.domain).href,
            url: page.url().toString(),
        }
    }
}
import { Client } from '@elastic/elasticsearch'
import { randomUUID } from 'crypto'
import { ProductCard } from './centrsvyazi'

const client = new Client({ node: 'http://localhost:9200' })

export async function indexData(index: string, type: string, document: ProductCard) {
    try {
        const response = await client.index({
            index,
            id: randomUUID(),
            body: {
                type,
                ...document
            },
        })

        console.log('Document indexed:', response)
    } catch (error) {
        console.error('Error indexing document:', error)
    }
}

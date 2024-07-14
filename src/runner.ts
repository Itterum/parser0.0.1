import {BaseEntity} from './baseEntity';

export default class Runner {
    public async run<T extends BaseEntity>(urls: string[], extractorName: string) {
        let data: T[] = [];

        const extractor = require(`./extractors/${extractorName}`);
        const extractorInstance = new extractor.default();

        for (const url of urls) {
            const result = await extractorInstance.parsePage(url);
            data.push(...result);
        }

        try {
            for (const entity of data) {
                await entity.save(extractorName);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            console.log('Data saved successfully');
        }
    }
}
import Database from './database';

export interface IBaseEntity {
    fields: {
        [key: string]: string | number
    };
    collected: {
        date: string
    };
}

export class BaseEntity implements IBaseEntity {
    fields: {
        [key: string]: string | number
    };
    collected: {
        date: string
    };

    constructor(fields: { [key: string]: string | number }) {
        this.fields = fields;
        const date = new Date();
        const timezone = 'Europe/Moscow';
        const options = {timeZone: timezone, hour12: false};
        this.collected = {
            date: date.toLocaleString('en-GB', {
                ...options,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }).replace(/\//g, '-'),
        };
    }

    async save(entityType: string) {
        const database = new Database();
        await database.saveData([this], entityType);
    }
}

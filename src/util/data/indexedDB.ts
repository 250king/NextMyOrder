import Dexie, { type EntityTable } from 'dexie';

export type LocalData = {
    id: number;
    tax?: number;
    fee?: number;
}

export const db = new Dexie('localDataDB') as Dexie & {
    localData: EntityTable<LocalData, "id">;
};

db.version(1).stores({
    localData: '++id, tax, fee'
});

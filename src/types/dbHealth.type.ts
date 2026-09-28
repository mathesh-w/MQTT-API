
interface DatabaseHealth {
    status: 'up' | 'down';
    latencyMs: number;
    database: string,
    error?: string;
}

interface DatabaseStats {
    database?: string;
    collections?: number;
    documents?: number;
    dataSizeBytes?: number;
    storageSizeBytes?: number;
    indexes?: number;
    avgObjectSize?: number;
    latencyMs?: number;
}

interface CollectionInfo {
    name: string;
    numberIndexs: number;
    records: number;
}

export type {DatabaseHealth, DatabaseStats, CollectionInfo};
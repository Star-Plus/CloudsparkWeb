export type DataSize = {
    size: number;
    unit: SizeUnit;
};

export enum SizeUnit {
    Bytes,
    KB,
    MB,
    GB
}

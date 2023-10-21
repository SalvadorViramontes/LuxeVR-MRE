export default interface Repository<T> {
    readAll(page?: number, pageSize?: number): Promise<T[]>;
    readAllByField(field: string, value: any, page?: number, pageSize?: number): Promise<T[]>;
    readAllByFields(fields: Record<string, any>, page?: number, pageSize?: number): Promise<T[]>;
    readById(id: number): Promise<T>;
    readByField(field: string, value: any): Promise<T>;
    readByFields(fields: Record<string, any>): Promise<T>;
    create(model: T): Promise<T>;
    update(model: Partial<T>): Promise<Partial<T>>;
    remove(id: number): Promise<number>;
}

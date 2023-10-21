import { CatchAll } from "../decorators/CatchDecorator";
import { MySqlModelDTO } from "../databases/models/_MySqlModel.dto";
import { Connection, OkPacket, RowDataPacket } from "mysql2/promise";

@CatchAll((err) => console.trace(err))
export default class IRepository<T extends MySqlModelDTO> {
    constructor(
        private connection: Connection,
        protected tableName: string,
        protected fields: string[]
    ) {}

    async readAll(): Promise<T[]> {
        const [queryResult] = await this.connection.query<Array<RowDataPacket & T>>(
            `SELECT * FROM ${this.tableName}`
        );
        return queryResult;
    }

    async readAllByField(field: string, value: any): Promise<T[]> {
        const [queryResult] = await this.connection.query<Array<RowDataPacket & T>>(
            `SELECT * FROM ${this.tableName} WHERE ${this.fieldWrapper(field)} = ${this.valueWrapper(value)}`
        );
        return queryResult;
    }

    private valueWrapper(value: any): string | null {
        switch (typeof value) {
            case 'number':
            case 'boolean':
                return `${value}`;
            case 'string': return `'${value}'`;
            default: return null;
        }
    }

    private fieldWrapper(field: string): string {
        return `\`${field}\``;
    }

    public async readById(id: number): Promise<T> {
        return this.readByField('id', id);
    }

    public async readByField(field: string, value: any): Promise<T> {
        const [[queryResult]] = await this.connection.query<Array<RowDataPacket & T>>(
            `SELECT * FROM ${this.tableName} WHERE ${this.fieldWrapper(field)} = ${this.valueWrapper(value)} LIMIT 1`
        );
        return queryResult;
    }

    public async create(model: T): Promise<T> {
        const fieldDeclaration = this.fields
            .filter(field => !field.startsWith('id'))
            .join(', ');
        const fieldValuePlaceholder = Object.entries(model)
            .filter(([field, _]) => !field.startsWith('id'))
            .map(([_, value]) => this.valueWrapper(value))
            .join(',');
        const [queryResult] = await this.connection.query<OkPacket>(
            `INSERT INTO ${this.tableName} (${fieldDeclaration}) VALUES(${fieldValuePlaceholder})`
        );
        const newModel = {
            ...model,
            id: queryResult.insertId
        }
        return newModel;
    }

    public async update(model: T): Promise<T> {
        const fieldValuesDeclaration = Object.entries(model)
            .filter(([field, _]) => !field.startsWith('id'))
            .map(([field, value]) => `${this.fieldWrapper(field)} = ${this.valueWrapper(value)}`)
            .join(', ');
        await this.connection.query<OkPacket>(
            `UPDATE ${this.tableName} SET ${fieldValuesDeclaration} WHERE ${this.fieldWrapper('id')} = ${this.valueWrapper(model.id)}`
        );
        const updatedModel = {
            ...model
        };
        return updatedModel;
    }

    public async remove(id: number): Promise<number> {
        const [queryResult] = await this.connection.query<OkPacket>(
            `DELETE FROM ${this.tableName} WHERE ${this.fieldWrapper('id')} = ${this.valueWrapper(id)}`
        );
        return queryResult.affectedRows;
    }
}

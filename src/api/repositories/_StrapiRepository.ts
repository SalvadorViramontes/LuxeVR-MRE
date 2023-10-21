/* tslint:disable camelcase */
import { AxiosInstance } from "axios";
import { Model } from "../../models/_Model";
import Repository from "../../contracts/Repository";
import { StrapiModel } from "../models/_StrapiModel";
import { CatchAll } from "../../decorators/CatchDecorator";
import { StrapiResponse } from "../models/_StrapiResponse";

@CatchAll((err) => console.trace(err))
export default class StrapiRepository<model extends Model, dto> implements Repository<model> {
    constructor(
        private instance: AxiosInstance,
        protected endpoint: string,
        protected _modelDtoMap: (model: Partial<model>) => Partial<dto>,
        protected dtoModelMap: (dtoWrap: StrapiModel<dto>) => model,
        protected query?: string
    ) {}

    private queryStarter(url: string): string {
        return /\?/u.exec(url) ? '&' : '?';
    }

    private modelDtoMap(model: Partial<model>): Partial<dto> {
        const dto = this._modelDtoMap(model);
        const cloneDto = JSON.parse(JSON.stringify(dto));
        Object.keys(model).forEach(key => {
            if(!Object.prototype.hasOwnProperty.call(cloneDto, key)) { delete (dto as Record<string, any>)[key]; }
        });
        return dto;
    }

    public async readUnique(): Promise<model> {
        let url = this.endpoint;
        if(this.query) { url += `?${this.query}`; }

        const response = await this.instance.get<StrapiResponse<StrapiModel<dto>>>(url);
        return this.dtoModelMap(response.data.data);
    }

    public async readAll(page?: number, pageSize?: number): Promise<model[]> {
        let url = this.endpoint;
        if(this.query) { url += `?${this.query}`; }
        if(page) { url += `${this.queryStarter(url)}pagination[page]=${page}`; }
        if(pageSize) { url += `${this.queryStarter(url)}pagination[pageSize]=${pageSize}`; }

        const response = await this.instance.get<StrapiResponse<Array<StrapiModel<dto>>>>(url);
        return response.data.data.map(dto => this.dtoModelMap(dto));
    }

    public async readAllByField(field: string, value: any, page?: number, pageSize?: number): Promise<model[]> {
        let url = `${this.endpoint}?filters[${field}][$eq]=${value}`;
        if(this.query) { url += `&${this.query}`; }
        if(page) { url += `&pagination[page]=${page}`; }
        if(pageSize) { url += `&pagination[pageSize]=${pageSize}`; }

        const response = await this.instance.get<StrapiResponse<Array<StrapiModel<dto>>>>(url);
        return response.data.data.map(dto => this.dtoModelMap(dto));
    }

    public async readAllByFields(fields: Record<string, any>, page?: number, pageSize?: number): Promise<model[]> {
        const filterString = Object.entries(fields).map(([field, value]) => {
            return `filters[${field}][$eq]=${value}`
        }).join('&');
        let url = `${this.endpoint}?${filterString}`;
        if(this.query) { url += `&${this.query}`; }
        if(page) { url += `&pagination[page]=${page}`; }
        if(pageSize) { url += `&pagination[pageSize]=${pageSize}`; }

        const response = await this.instance.get<StrapiResponse<Array<StrapiModel<dto>>>>(url);
        return response.data.data.map(dto => this.dtoModelMap(dto));
    }

    public async readById(id: number): Promise<model> {
        let url = `${this.endpoint}/${id}`;
        if(this.query) { url += `?${this.query}`; }

        const response = await this.instance.get<StrapiResponse<StrapiModel<dto>>>(url);
        if(!response.data) { return null; }
        return this.dtoModelMap(response.data.data);
    }

    public async readByField(field: string, value: any): Promise<model> {
        const [result] = await this.readAllByField(field, value);
        if(!result) { return null }
        return result;
    }

    public async readByFields(fields: Record<string, any>): Promise<model> {
        const [result] = await this.readAllByFields(fields);
        if(!result) { return null; }
        return result;
    }

    public async create(model: model): Promise<model> {
        const result = await this.instance.post<StrapiResponse<StrapiModel<dto>>>(this.endpoint, {
            data: this.modelDtoMap(model)
        });
        return this.dtoModelMap(result.data.data);
    }

    public async update(model: Partial<model>): Promise<Partial<model>> {
        if(!model.id) { throw new Error(`Model needs to have at least the id field`); }
        const oldModel = await this.readById(model.id);
        if(!oldModel) { throw new Error(`No model with id ${model.id} exists`); }
        const result = await this.instance.put<StrapiResponse<StrapiModel<dto>>>(`${this.endpoint}/${model.id}`, {
            data: this.modelDtoMap(model)
        });
        return this.dtoModelMap(result.data.data);
    }
    
    public async remove(id: number): Promise<number> {
        const existingResponse = await this.readById(id);
        if(!existingResponse) { throw new Error(`Could not find item with id ${id}`); }
        const deleteResponse = await this.instance.delete<StrapiResponse<StrapiModel<dto>>>(`${this.endpoint}/${id}`);
        return deleteResponse.data.data.id;
    }
}

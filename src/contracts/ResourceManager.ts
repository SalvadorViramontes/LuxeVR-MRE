import AsyncMap from "../models/AsyncMap";
import LogHelper from "../helpers/LogHelper";
import { Resource } from "../models/Resource";
import { LogVerbosity } from "../enums/LogVerbosity";
import { ResourceType } from "../types/ResourceType";
import { CatchAll } from "../decorators/CatchDecorator";
import { Guid } from "@microsoft/mixed-reality-extension-sdk";

@CatchAll((err) => console.trace(err))
export default abstract class ResourceManager<T> {
    public name = '';
    private resources: Record<string, T>;
    private actorIdToResourceIdMap: AsyncMap<Guid, T>;

    constructor(private logHelper: LogHelper){
        this.resources = {};
        this.actorIdToResourceIdMap = new AsyncMap<Guid, T>();
    }

    public AddResource(key: string, resource: T): void {
        const aResource = new Resource(resource as unknown as ResourceType);
        this.logHelper.info(this.name, `Adding resource ${key}: ${aResource.id}`, LogVerbosity.Five);
        this.resources[key] = resource;
    }
    
    public GetResource(key: string): T {
        this.logHelper.info(this.name, `Getting resource ${key}`, LogVerbosity.Five);
        return this.resources[key];
    }
    
    public async SetActorToResourceMap(actorId: Guid, resourceId: T): Promise<void> {
        this.logHelper.info(this.name, `Setting actor ${actorId} to resourceId ${resourceId}`, LogVerbosity.Five);
        await this.actorIdToResourceIdMap.set(actorId, resourceId);
    }
    
    public async GetActorToResourceMap(actorId: Guid): Promise<T> {
        this.logHelper.info(this.name, `Getting actor ${actorId} resourceId`, LogVerbosity.Five);
        return await this.actorIdToResourceIdMap.get(actorId);
    }
    
    public async DeleteActorFromResourceMap(actorId: Guid): Promise<void> {
        this.logHelper.info(this.name, `Deleting actor ${actorId} resource`, LogVerbosity.Five);
        await this.actorIdToResourceIdMap.delete(actorId);
    }

    public abstract CompareResourceToWearable(resource: T, wearable: T): boolean;
}

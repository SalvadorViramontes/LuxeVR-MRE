import AsyncMap from "../models/AsyncMap";
import LogHelper from "../helpers/LogHelper";
import { Resource } from "../models/Resource";
import { LogVerbosity } from "../enums/LogVerbosity";
import { ResourceType } from "../types/ResourceType";
import { CatchAll } from "../decorators/CatchDecorator";
import { User } from "@microsoft/mixed-reality-extension-sdk";
import { CustomAssetTransform } from "../models/CustomAssetTransform";
import { CustomAssetTransformType } from "../enums/CustomAssetTransformType";
import { WearableAssetDescriptor } from "../types/descriptors/WearableAssetDescriptor";
import CustomAssetTransformHandlerFactory from "../factories/CustomAssetTransformHandlerFactory";
import { AssetTransformResponse } from "../types/AssetTranformResponse";

@CatchAll((err) => console.trace(err))
export default class ActorCustomTransformManager {
    private actorTransformMapper = new AsyncMap<string, CustomAssetTransform>();

    constructor(private logHelper: LogHelper){ }

    @CatchAll((err) => console.trace(err))
    public static GetResourceId(
        user: User,
        resource: ResourceType
    ): string {
        const aResource = new Resource(resource);
        let resourceId = aResource.id;
        resourceId = `${user.id.toString()}-${resourceId}`;
        return resourceId;
    }

    @CatchAll((err) => console.trace(err))
    public static ModifyCustomTransform(
        customTransform: CustomAssetTransform,
        transformType: CustomAssetTransformType
    ): AssetTransformResponse {
        const customAssetTransformHandler = CustomAssetTransformHandlerFactory.GetHandler(transformType);
        const newCustomAssetTransform = customAssetTransformHandler.TransformCoordinates(customTransform);
        const newTransformationDescription = customAssetTransformHandler.DescribeTransformation(newCustomAssetTransform);
        return {
            Transform: newCustomAssetTransform,
            Description: newTransformationDescription
        };
    }

    public async NewActorTransformResource(
        user: User,
        assetDescriptor: WearableAssetDescriptor,
        resource: ResourceType
    ): Promise<void> {
        const resourceId = ActorCustomTransformManager.GetResourceId(user, resource);
        this.logHelper.info('actor-custom-transform', `New actor transform resource ${resourceId
        } for user ${user.name}: ${assetDescriptor.resourceName}`, LogVerbosity.Four);
            
        if(!await this.actorTransformMapper.has(resourceId)){
            this.logHelper.info('actor-custom-transform', `Setting new actorTransformMapper for resource ${
                resourceId} and user ${user.name}`, LogVerbosity.Four);

            const customAssetTransform = {
                rotation: assetDescriptor.wearable.rotation,
                position: assetDescriptor.wearable.position,
                scale: assetDescriptor.wearable.scale.y
            }
            await this.actorTransformMapper.set(resourceId, customAssetTransform);
        }
    }

    public async GetActorTransformResource(user: User, resource: ResourceType): Promise<CustomAssetTransform> {
        const resourceId = ActorCustomTransformManager.GetResourceId(user, resource);
        this.logHelper.info('actor-custom-transform', `Getting actor transform resource ${
            resourceId} for user ${user.name}`, LogVerbosity.Four);
        return await this.actorTransformMapper.get(resourceId);
    }
    
    public async SetActorTransformResource(
        user: User,
        resource: ResourceType,
        newCustomAssetTransform: CustomAssetTransform
    ): Promise<void> {
        const resourceId = ActorCustomTransformManager.GetResourceId(user, resource);
        this.logHelper.info('actor-custom-transform', `Setting actor transform resource ${
            resourceId} for user ${user.name}: ${JSON.stringify(newCustomAssetTransform)}`,
        LogVerbosity.Four);
        await this.actorTransformMapper.set(resourceId, newCustomAssetTransform);
    }
}

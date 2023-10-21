import LogHelper from "../helpers/LogHelper";
import RepositoryManager from "./RepositoryManager";
import { LogVerbosity } from "../enums/LogVerbosity";
import { CatchAll } from "../decorators/CatchDecorator";
import { WearableAsset } from "../models/WearableAsset";
import { User } from "@microsoft/mixed-reality-extension-sdk";
import { AssetTransform } from "../types/descriptors/AssetTransform";
import { AssetTransformResponse } from "../types/AssetTranformResponse";
import { CustomAssetTransformType } from "../enums/CustomAssetTransformType";
import { UserCustomAssetTransforms } from "../models/UserCustomAssetTransforms";
import CustomAssetTransformHandlerFactory from "../factories/CustomAssetTransformHandlerFactory";

@CatchAll((err) => console.trace(err))
export default class ActorCustomTransformManager {
    constructor(
        private logHelper: LogHelper,
        private customAssetTransformHandlerFactory: CustomAssetTransformHandlerFactory,
        private repositoryManager: RepositoryManager
    ){ }

    @CatchAll((err) => console.trace(err))
    private static removeIds(assetTransform: AssetTransform): AssetTransform {
        const scale = JSON.parse(JSON.stringify(assetTransform.scale));
        const rotation = JSON.parse(JSON.stringify(assetTransform.rotation));
        const position = JSON.parse(JSON.stringify(assetTransform.position));
        delete scale.id;
        delete rotation.id;
        delete position.id;
        return {
            scale,
            rotation,
            position
        }
    }

    public ModifyCustomTransform(
        customTransform: AssetTransform,
        transformType: CustomAssetTransformType
    ): AssetTransformResponse {
        const customAssetTransformHandler = this.customAssetTransformHandlerFactory.GetHandler(transformType);
        const newCustomAssetTransform = customAssetTransformHandler.TransformCoordinates(customTransform);
        const newTransformationDescription = customAssetTransformHandler.DescribeTransformation(newCustomAssetTransform);
        return {
            Transform: newCustomAssetTransform,
            Description: newTransformationDescription
        };
    }

    public async NewActorTransformResource(
        user: User,
        wearableAsset: WearableAsset
    ): Promise<void> {
        const oldCustomActorTransform = await this.repositoryManager.userCustomAssetTransformsRepository.readByFields({
            "altspace_user][altspace_id": user.id.toString(),
            "wearable_asset][assetKey": wearableAsset.assetKey
        })
        this.logHelper.info('actor-custom-transform', `New actor transform on asset ${wearableAsset.assetKey
        } for user ${user.name}`, LogVerbosity.Four);
            
        if(!oldCustomActorTransform){
            this.logHelper.info('actor-custom-transform', `Setting new actorTransformMapper for asset ${
                wearableAsset.assetKey} and user ${user.name}`, LogVerbosity.Four);
            
            const altspaceUser = await this.repositoryManager.altspaceUserRepository.readByField('altspace_id', user.id.toString())
            const newCustomAssetTransform: UserCustomAssetTransforms = {
                altspaceUser,
                wearableAsset,
                customAssetTransform: ActorCustomTransformManager.removeIds(wearableAsset.wearable)
            }
            await this.repositoryManager.userCustomAssetTransformsRepository.create(newCustomAssetTransform);
        }
    }

    public async GetActorTransformResource(user: User, wearableAsset: WearableAsset): Promise<AssetTransform> {
        this.logHelper.info('actor-custom-transform', `Getting actor transform resource ${
            wearableAsset.assetKey} for user ${user.name}`, LogVerbosity.Four);
        const userCustomAssetTransform = await this.repositoryManager.userCustomAssetTransformsRepository.readByFields({
            "altspace_user][altspace_id": user.id.toString(),
            "wearable_asset][assetKey": wearableAsset.assetKey
        });
        const customAssetTransform = userCustomAssetTransform.customAssetTransform;
        return customAssetTransform;
    }
    
    public async SetActorTransformResource(
        user: User,
        wearableAsset: WearableAsset,
        customAssetTransform: AssetTransform
    ): Promise<void> {
        this.logHelper.info('actor-custom-transform', `Setting actor transform resource ${
            wearableAsset.assetKey} for user ${user.name}: ${JSON.stringify(customAssetTransform)}`,
        LogVerbosity.Four);
        const oldUserCustomAssetTransform = await this.repositoryManager.userCustomAssetTransformsRepository.readByFields({
            "altspace_user][altspace_id": user.id.toString(),
            "wearable_asset][assetKey": wearableAsset.assetKey
        });
        const newCustomAssetTransform: Partial<UserCustomAssetTransforms> = {
            id: oldUserCustomAssetTransform.id,
            customAssetTransform: ActorCustomTransformManager.removeIds(customAssetTransform)
        }
        await this.repositoryManager.userCustomAssetTransformsRepository.update(newCustomAssetTransform)
    }
}

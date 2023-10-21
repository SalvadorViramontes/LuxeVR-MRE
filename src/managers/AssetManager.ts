import {
    Actor,
    AlphaMode,
    AssetContainer,
    AttachPoint,
    ColliderType,
    CollisionLayer,
    Color3,
    Color4,
    Context,
    Guid,
    Mesh,
    Prefab,
    User
} from '@microsoft/mixed-reality-extension-sdk';
import PrefabManager from './PrefabManager';
import LogHelper from '../helpers/LogHelper';
import { Nullable } from '../types/Generics';
import ArtifactManager from './ArtifactManager';
import UriHandler from '../contracts/UriHandler';
import AttachmentManager from './AttachmentManager';
import RepositoryManager from './RepositoryManager';
import ActorFactory from '../factories/ActorFactory';
import { ResourceType } from '../types/ResourceType';
import { CatchAll } from '../decorators/CatchDecorator';
import { WearableAsset } from '../models/WearableAsset';
import { MembershipMask } from '../enums/MembershipMask';
import { AttachmentPoint } from '../enums/AttachmentPoint';
import ResourceManager from '../contracts/ResourceManager';
import UserMembershipManager from './UserMembershipManager';
import { TransformUtilities } from '../utils/TransformUtilities';
import { AssetDescriptor } from '../types/descriptors/AssetDescriptor';
import ActorCustomTransformManager from './ActorCustomTransformManager';
import { CustomAssetTransformType } from '../enums/CustomAssetTransformType';
import { GlobalConfigurationService } from '../services/GlobalConfigurationService';
import { WearableAssetDescriptor } from '../types/descriptors/WearableAssetDescriptor';
import { JsUtilities } from '../utils/JsUtilities';

@CatchAll((err) => console.trace(err))
export default class AssetManager {
    public baseActor: Actor;

    public materialIds: Record<string, Guid> = {};
    public colors: Record<string, Color3> = {};
    public meshIds: Record<string, Guid> = {};

    constructor(
        public context: Context,
        public logHelper: LogHelper,
        public assetContainer: AssetContainer,
        private attachmentManager: AttachmentManager,
        private userMembershipManager: UserMembershipManager,
        private actorFactory: ActorFactory,
        private prefabManager: PrefabManager,
        private artifactManager: ArtifactManager,
        private actorCustomTransformManager: ActorCustomTransformManager,
        private globalConfigurationService: GlobalConfigurationService,
        private repositoryManager: RepositoryManager
    ) {
        this.baseActor = this.actorFactory.CreateActor({
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.Navigation,
                enabled: false
            }
        });
        this.createMaterials();
        this.createColors();
    }

    private createMaterials() {
        this.materialIds['transparent'] = this.assetContainer.createMaterial('transparent', {
            color: this.globalConfigurationService.isDebug ?
                { r: 128, g: 128, b: 128, a: 0.15 } :
                { r: 0, g: 0, b: 0, a: 0 },
            alphaMode: AlphaMode.Blend
        }).id;
        this.materialIds['transparent-red'] = this.assetContainer.createMaterial('transparent-red', {
            color: this.globalConfigurationService.isDebug ?
                { r: 128, g: 0, b: 0, a: 0.15 } :
                { r: 0, g: 0, b: 0, a: 0 },
            alphaMode: AlphaMode.Blend
        }).id;
        this.materialIds['transparent-green'] = this.assetContainer.createMaterial('transparent-green', {
            color: this.globalConfigurationService.isDebug ?
                { r: 0, g: 128, b: 0, a: 0.15 } :
                { r: 0, g: 0, b: 0, a: 0 },
            alphaMode: AlphaMode.Blend
        }).id;
        this.materialIds['transparent-blue'] = this.assetContainer.createMaterial('transparent-blue', {
            color: this.globalConfigurationService.isDebug ?
                { r: 0, g: 0, b: 128, a: 0.15 } :
                { r: 0, g: 0, b: 0, a: 0 },
            alphaMode: AlphaMode.Blend
        }).id;
        this.materialIds['transparent-cyan'] = this.assetContainer.createMaterial('transparent-cyan', {
            color: this.globalConfigurationService.isDebug ?
                { r: 0, g: 128, b: 128, a: 0.15 } :
                { r: 0, g: 0, b: 0, a: 0 },
            alphaMode: AlphaMode.Blend
        }).id;
        this.materialIds['transparent-magenta'] = this.assetContainer.createMaterial('transparent-magenta', {
            color: this.globalConfigurationService.isDebug ?
                { r: 128, g: 0, b: 128, a: 0.15 } :
                { r: 0, g: 0, b: 0, a: 0 },
            alphaMode: AlphaMode.Blend
        }).id;
        this.materialIds['transparent-yellow'] = this.assetContainer.createMaterial('transparent-yellow', {
            color: this.globalConfigurationService.isDebug ?
                { r: 128, g: 128, b: 0, a: 0.15 } :
                { r: 0, g: 0, b: 0, a: 0 },
            alphaMode: AlphaMode.Blend
        }).id;

        this.materialIds['solidBlack'] = this.assetContainer.createMaterial('solidBlack', {
            color: Color4.FromHexString("000000ff"),
            alphaMode: AlphaMode.Opaque
        }).id;

        this.materialIds['selected'] = this.assetContainer.createMaterial('selected', {
            color: Color4.FromHexString("FFD70088"),
            alphaMode: AlphaMode.Blend
        }).id;
    }

    private createColors() {
        this.colors['white'] = Color3.Red();
    }

    private async assetMembership(assetKey: string): Promise<Nullable<MembershipMask>> {
        try{
            const wearableAsset = await this.repositoryManager.wearableAssetsRepository.readByField('assetKey', assetKey);
            if (wearableAsset.type === 'public') { return MembershipMask.Public; }
            if (wearableAsset.type === 'member') { return MembershipMask.Member; }
        } catch(e){
            return null;
        }
    }

    private async membershipGuard(userId: Guid, assetKey: string): Promise<boolean> {
        const assetMembership = await this.assetMembership(assetKey);
        if (assetMembership === MembershipMask.Member && !await this.userMembershipManager.IsMember(userId)) {
            return false;
        } else {
            return true;
        }
    }

    public createButtonMesh(assetKey: string): Mesh {
        const mesh = this.assetContainer.createBoxMesh(assetKey, 1, 1, 1);
        this.meshIds[assetKey] = mesh.id;

        return mesh;
    }

    public createCylinderMesh(assetKey: string): Mesh {
        const mesh = this.assetContainer.createCylinderMesh(assetKey, 1, 0.5);
        this.meshIds[assetKey] = mesh.id;

        return mesh;
    }

    private async assetPromise(assetDescriptor: AssetDescriptor, assetKey: string): Promise<void> {
        if (assetDescriptor.resourceName) {
            if (ActorFactory.CheckIfArtifactAsset(assetDescriptor.resourceName)) {
                this.artifactManager.AddResource(assetKey, assetDescriptor.resourceName);
            } else {
                try {
                    const uri = UriHandler.GetAssetUri(assetDescriptor.resourceName);
                    const loadedAssets = await this.assetContainer.loadGltf(uri);
                    const prefab = loadedAssets.find(asset => asset.prefab !== null) as Prefab;
                    this.prefabManager.AddResource(assetKey, prefab);
                } catch (e) {
                    this.logHelper.error("asset-manager", e);
                }
            }
        } else {
            return;
        }
    }

    public async preloadAssets(): Promise<void> {
        this.logHelper.info("asset-manager", `Preloading assets`);
        const initialPublicAssetsPromise = this.repositoryManager.wearableAssetsRepository.readAllByField('type', 'public');
        await JsUtilities.delay(10);
        const initialMemberAssetsPromise = this.repositoryManager.wearableAssetsRepository.readAllByField('type', 'member');
        await JsUtilities.delay(10);
        const initialTransformButtonAssetPromise = this.repositoryManager.transformButtonsRepository.readUnique();
        
        const [publicAssets, memberAssets, transformButtonsAssets] = await Promise.all([
            initialPublicAssetsPromise,
            initialMemberAssetsPromise,
            initialTransformButtonAssetPromise
        ])

        const publicAssetPromises = publicAssets.map(publicAsset => {
            return this.assetPromise(publicAsset, publicAsset.assetKey);
        });

        const memberAssetPromises = memberAssets.map(memberAsset => {
            return this.assetPromise(memberAsset, memberAsset.assetKey);
        });

        const transformButtonsAssetPromise = this.assetPromise(transformButtonsAssets, 'transformButtons');

        await Promise.all([
            ...publicAssetPromises,
            ...memberAssetPromises,
            transformButtonsAssetPromise
        ]);
        this.logHelper.info("asset-manager", 'Preloaded all assets');
    }

    private selectResourceManager(asset: AssetDescriptor): ResourceManager<ResourceType> {
        if (ActorFactory.CheckIfArtifactAsset(asset.resourceName)) {
            return this.artifactManager;
        } else {
            return this.prefabManager;
        }
    }

    public async getAsset(assetKey: string): Promise<Nullable<WearableAsset>> {
        try{
            const wearableAsset = await this.repositoryManager.wearableAssetsRepository.readByField('assetKey', assetKey);
            if (wearableAsset) { return wearableAsset; } else { return null; }
        } catch(e){
            return null;
        }
    }

    public async hasThisAsset(userId: Guid, assetKey: string): Promise<boolean> {
        const asset = await this.getAsset(assetKey) as WearableAssetDescriptor;

        if (!asset) { return false; }
        const resourceManager = this.selectResourceManager(asset);
        const resource = resourceManager.GetResource(assetKey);
        const wearableActor = await this.attachmentManager.GetUserAttachment(userId, asset.attachmentPoint);

        if (!wearableActor) { return false; }
        const wearableResource = await resourceManager.GetActorToResourceMap(wearableActor.id);
        return resourceManager.CompareResourceToWearable(resource, wearableResource);
    }

    public async hasAnyAsset(userId: Guid, attachmentPoint: AttachmentPoint): Promise<boolean> {
        const wearable = await this.attachmentManager.GetUserAttachment(userId, attachmentPoint);
        return !!wearable
    }

    public async wearAsset(user: User, assetKey: string): Promise<void> {
        if (!await this.membershipGuard(user.id, assetKey)) { return; }

        const wearableAsset = await this.getAsset(assetKey);
        const resourceManager = this.selectResourceManager(wearableAsset);
        const wearableResource = resourceManager.GetResource(assetKey);
        await this.actorCustomTransformManager.NewActorTransformResource(user, wearableAsset);
        const transformResource = await this.actorCustomTransformManager.GetActorTransformResource(user, wearableAsset);

        const wearableActor = this.actorFactory.CreateActor({
            transform: {
                local: TransformUtilities.CustomTransformWrapper(transformResource)
            },
            attachment: {
                attachPoint: wearableAsset.attachmentPoint as AttachPoint,
                userId: user.id
            }
        }, assetKey, wearableAsset);

        await resourceManager.SetActorToResourceMap(wearableActor.id, wearableResource);

        await this.attachmentManager.SetUserAttachment(user.id, wearableAsset.attachmentPoint, wearableActor);
        this.logHelper.userAction(user, `Wearing asset ${assetKey}`);
    }

    public async removeAllAssets(user: User): Promise<void> {
        this.logHelper.info('asset-manager', `Removing all assets from user ${user.name}`);
        const actorIds = await this.attachmentManager.GetAllActorIds(user.id);
        await Promise.all(actorIds.map(async actorId => {
            await this.prefabManager.DeleteActorFromResourceMap(actorId);
            await this.artifactManager.DeleteActorFromResourceMap(actorId);
        }));

        await this.attachmentManager.RemoveAllUserAttachments(user.id);
        this.logHelper.info('asset-manager', `Removed all assets from user ${user.name}`);
    }

    public async removeAsset(user: User, assetKey: string): Promise<void> {
        if (!await this.membershipGuard(user.id, assetKey)) { return; }

        const wearableAsset = await this.getAsset(assetKey);
        const wearableActor = await this.attachmentManager.GetUserAttachment(user.id, wearableAsset.attachmentPoint);

        const resourceManager = this.selectResourceManager(wearableAsset);
        await resourceManager.DeleteActorFromResourceMap(wearableActor.id);
        await this.attachmentManager.RemoveUserAttachment(user.id, wearableAsset.attachmentPoint);
        this.logHelper.userAction(user, `Removing asset ${assetKey}`);
    }

    public async wearLogic(user: User, assetKey: string): Promise<void> {
        this.logHelper.info('asset-manager', `${user.name} clicking ${assetKey} asset`);
        const wearableAsset = await this.getAsset(assetKey);

        if (!await this.hasAnyAsset(user.id, wearableAsset.attachmentPoint)) {
            await this.wearAsset(user, assetKey);
        } else {
            if (await this.hasThisAsset(user.id, assetKey)) {
                await this.removeAsset(user, assetKey);
            } else {
                await this.removeAsset(user, assetKey);
                await this.wearAsset(user, assetKey);
            }
        }
    }

    public async modifyAssetTransform(
        user: User,
        assetKey: string,
        transformType: CustomAssetTransformType
    ): Promise<void> {
        const wearableAsset = await this.getAsset(assetKey);
        const resourceManager = this.selectResourceManager(wearableAsset);
        const wearableResource = resourceManager.GetResource(assetKey);
        
        const customAssetTransform = await this.actorCustomTransformManager.GetActorTransformResource(user, wearableAsset);
        const newAssetTransformResponse = this.actorCustomTransformManager.ModifyCustomTransform(customAssetTransform, transformType);
        this.logHelper.info('asset-manager', `Modifying asset transform ${assetKey} from user ${
            user.name}: ${newAssetTransformResponse.Description}`);
        await this.actorCustomTransformManager.SetActorTransformResource(user, wearableAsset, newAssetTransformResponse.Transform);

        const oldWearableActor = await this.attachmentManager.GetUserAttachment(user.id, wearableAsset.attachmentPoint);
        await resourceManager.DeleteActorFromResourceMap(oldWearableActor.id);
        await this.attachmentManager.RemoveUserAttachment(user.id, wearableAsset.attachmentPoint);

        const newWearableActor = this.actorFactory.CreateActor({
            transform: {
                local: TransformUtilities.CustomTransformWrapper(newAssetTransformResponse.Transform)
            },
            attachment: {
                attachPoint: wearableAsset.attachmentPoint,
                userId: user.id
            }
        }, assetKey, wearableAsset);

        await resourceManager.SetActorToResourceMap(newWearableActor.id, wearableResource);
        await this.attachmentManager.SetUserAttachment(user.id, wearableAsset.attachmentPoint, newWearableActor);
    }
}

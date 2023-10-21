import {
    Actor,
    AlphaMode,
    AssetContainer,
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
import LogHelper from '../helpers/LogHelper';
import PrefabManager from './PrefabManager';
import { Nullable } from '../types/Generics';
import ArtifactManager from './ArtifactManager';
import GlbService from '../services/GlbService';
import UriHandler from '../contracts/UriHandler';
import AttachmentManager from './AttachmentManager';
import ActorFactory from '../factories/ActorFactory';
import { ResourceType } from '../types/ResourceType';
import { CatchAll } from '../decorators/CatchDecorator';
import { TransformUtilities } from '../utils/TransformUtilities';
import { MembershipMask } from '../enums/MembershipMask';
import ArtifactService from '../services/ArtifactService';
import { AttachmentPoint } from '../enums/AttachmentPoint';
import ResourceManager from '../contracts/ResourceManager';
import UserMembershipManager from './UserMembershipManager';
import { AssetDescriptor } from '../types/descriptors/AssetDescriptor';
import ActorCustomTransformManager from './ActorCustomTransformManager';
import { CustomAssetTransformType } from '../enums/CustomAssetTransformType';
import { GlobalConfigurationService } from '../services/GlobalConfigurationService';
import { WearableAssetDescriptor } from '../types/descriptors/WearableAssetDescriptor';
import { Descriptor } from '../types/descriptors/Descriptor';

@CatchAll((err) => console.trace(err))
export default class AssetManager {
    public baseActor: Actor;

    public publicAssets: Record<string, Descriptor>;
    public memberAssets: Record<string, Descriptor>;
    public utilityAssets: Record<string, Descriptor>;

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

    private assetMembership(assetKey: string): Nullable<MembershipMask> {
        const publicAsset = this.publicAssets[assetKey];
        const memberAsset = this.memberAssets[assetKey];

        if (publicAsset) { return MembershipMask.Public; }
        if (memberAsset) { return MembershipMask.Member; }
        return null;
    }

    private async membershipGuard(userId: Guid, assetKey: string): Promise<boolean> {
        const assetMembership = this.assetMembership(assetKey);
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

    private async assetPromise(
        assetRecord: Record<string, Descriptor>,
        assetKey: string
    ): Promise<void> {
        const item = assetRecord[assetKey] as AssetDescriptor;
        if (item.resourceName) {
            if (ActorFactory.CheckIfArtifactAsset(item.resourceName)) {
                this.artifactManager.AddResource(assetKey, item.resourceName);
            } else {
                try {
                    const uri = UriHandler.GetAssetUri(item.resourceName);
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

    public preloadAssets(): Promise<void> {
        this.logHelper.info("asset-manager", `Preloading assets`);
        this.publicAssets = ArtifactService.GetPublicAssetDeclaration();
        this.memberAssets = ArtifactService.GetMemberAssetDeclaration();
        this.utilityAssets = GlbService.GetUtilityAssetDeclaration();

        const publicAssetPromises = Object.keys(this.publicAssets).map(assetKey => {
            return this.assetPromise(this.publicAssets, assetKey);
        });

        const memberAssetPromises = Object.keys(this.memberAssets).map(assetKey => {
            return this.assetPromise(this.memberAssets, assetKey);
        });

        const utilityAssetPromises = Object.keys(this.utilityAssets).map(assetKey => {
            return this.assetPromise(this.utilityAssets, assetKey);
        })

        return Promise.all([
            ...publicAssetPromises,
            ...memberAssetPromises,
            ...utilityAssetPromises
        ]).then(() => {
            this.logHelper.info("asset-manager", 'Preloaded all assets');
        });
    }

    private selectResourceManager(asset: AssetDescriptor): ResourceManager<ResourceType> {
        if (ActorFactory.CheckIfArtifactAsset(asset.resourceName)) {
            return this.artifactManager;
        } else {
            return this.prefabManager;
        }
    }

    public getAsset(assetKey: string): Nullable<Descriptor> {
        const publicAsset = this.publicAssets[assetKey];
        const memberAsset = this.memberAssets[assetKey];
        const utilityAsset = this.utilityAssets[assetKey];

        if (publicAsset) { return publicAsset; }
        if (memberAsset) { return memberAsset; }
        if (utilityAsset) { return utilityAsset; }
        return null;
    }

    public async hasThisAsset(userId: Guid, assetKey: string): Promise<boolean> {
        const asset = this.getAsset(assetKey) as WearableAssetDescriptor;

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

        const wearableAsset = this.getAsset(assetKey) as WearableAssetDescriptor;
        const resourceManager = this.selectResourceManager(wearableAsset);
        const wearableResource = resourceManager.GetResource(assetKey);
        await this.actorCustomTransformManager.NewActorTransformResource(user, wearableAsset, wearableResource);
        const transformResource = await this.actorCustomTransformManager.GetActorTransformResource(user, wearableResource);

        const wearableActor = this.actorFactory.CreateActor({
            transform: {
                local: TransformUtilities.CustomTransformWrapper(transformResource)
            },
            attachment: {
                attachPoint: wearableAsset.attachmentPoint,
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

        const wearableAsset = this.getAsset(assetKey) as WearableAssetDescriptor;
        const wearableActor = await this.attachmentManager.GetUserAttachment(user.id, wearableAsset.attachmentPoint);

        const resourceManager = this.selectResourceManager(wearableAsset);
        await resourceManager.DeleteActorFromResourceMap(wearableActor.id);
        await this.attachmentManager.RemoveUserAttachment(user.id, wearableAsset.attachmentPoint);
        this.logHelper.userAction(user, `Removing asset ${assetKey}`);
    }

    public async wearLogic(user: User, assetKey: string): Promise<void> {
        this.logHelper.info('asset-manager', `${user.name} clicking ${assetKey} asset`);
        const asset = this.getAsset(assetKey) as WearableAssetDescriptor;

        if (!await this.hasAnyAsset(user.id, asset.attachmentPoint)) {
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
        const wearableAsset = this.getAsset(assetKey) as WearableAssetDescriptor;
        const resourceManager = this.selectResourceManager(wearableAsset);
        const wearableResource = resourceManager.GetResource(assetKey);
        
        const customAssetTransform = await this.actorCustomTransformManager.GetActorTransformResource(user, wearableResource);
        const newAssetTransformResponse = ActorCustomTransformManager.ModifyCustomTransform(customAssetTransform, transformType);
        this.logHelper.info('asset-manager', `Modifying asset transform ${assetKey} from user ${
            user.name}: ${newAssetTransformResponse.Description}`);
        await this.actorCustomTransformManager.SetActorTransformResource(user, wearableResource, newAssetTransformResponse.Transform);

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

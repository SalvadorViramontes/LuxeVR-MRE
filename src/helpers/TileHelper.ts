import {
    Actor,
    ColliderType,
    CollisionLayer,
    Guid,
    Vector3Like
} from "@microsoft/mixed-reality-extension-sdk";
import { PanelTile } from "../models/PanelTile";
import EnumUtilities from "../utils/EnumUtilities";
import AssetManager from "../managers/AssetManager";
import ActorFactory from "../factories/ActorFactory";
import { CatchAll } from "../decorators/CatchDecorator";
import { TransformUtilities } from "../utils/TransformUtilities";
import { panelTileSizes } from "../constants/configuration/panelTileSizes";
import { CustomAssetTransformType } from "../enums/CustomAssetTransformType";
import { MenuAssetDescriptor } from "../types/descriptors/MenuAssetDescriptor";
import { panelTileLocators } from "../constants/configuration/panelTileLocators";
import { GlobalConfigurationService } from "../services/GlobalConfigurationService";
import { TransformControlDescriptor } from "../types/descriptors/TransformControlDescription";

@CatchAll((err) => console.trace(err))
export default class TileHelper {
    private tileSizes: Vector3Like[];
    private tilePositions: Vector3Like[];

    constructor(
        private actorFactory: ActorFactory,
        private assetManager: AssetManager,
        private globalConfigurationService: GlobalConfigurationService
    ) {
        this.tileSizes = panelTileSizes as unknown as Vector3Like[];
        this.tilePositions = panelTileLocators as unknown as Vector3Like[];
    }

    public createPanelTile(
        userId: Guid,
        panelActor: Actor,
        assetKey: string,
        tileNumber: number
    ): PanelTile {
        const controlAsset = this.assetManager.utilityAssets['transformButtons'] as TransformControlDescriptor;
        const memberAsset = this.assetManager.memberAssets[assetKey] as MenuAssetDescriptor;
        const buttonMesh = this.assetManager.createButtonMesh(`${userId}-${assetKey}-icon`);
        const tileBackgroundMesh = this.assetManager.createButtonMesh(`${userId}-tile-${tileNumber}`);

        const AnchorActor = this.actorFactory.CreateActor({
            parentId: panelActor.id,
            exclusiveToUser: userId,
            appearance: {
                enabled: false,
            },
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.Navigation,
                enabled: false
            },
            transform: {
                local: TransformUtilities.AnchorWrapper(this.tilePositions[tileNumber])
            }
        });

        const AnchorDebugger = (this.globalConfigurationService.isDebug) ? this.actorFactory.CreateActor({
            parentId: panelActor.id,
            exclusiveToUser: userId,
            appearance: {
                enabled: false,
                meshId: tileBackgroundMesh.id,
                materialId: this.assetManager.materialIds['transparent'],
            },
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.Hologram,
                enabled: false
            },
            rigidBody: {
                detectCollisions: false,
                useGravity: false,
            },
            transform: {
                local: TransformUtilities.PanelAnchorDebugWrapper(this.tileSizes[tileNumber], this.tilePositions[tileNumber])
            }
        }) : null;

        const AssetActor = this.actorFactory.CreateActor({
            parentId: AnchorActor.id,
            name: `m_${userId.toString()}-${assetKey}-asset`,
            appearance: {
                enabled: false,
            },
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.Hologram,
                enabled: false
            },
            rigidBody: {
                detectCollisions: false,
                useGravity: false,
            },
            exclusiveToUser: userId,
            transform: {
                local: TransformUtilities.PanelIconTransformWrapper(memberAsset.menu, tileNumber)
            },
        }, assetKey, memberAsset);

        const AssetButton = this.actorFactory.CreateButton({
            parentId: AnchorActor.id,
            name: `m_${userId.toString()}-${assetKey}-button`,
            appearance: {
                meshId: buttonMesh.id,
                enabled: false,
                materialId: this.assetManager.materialIds['transparent-cyan'],
            },
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.UI,
                enabled: false
            },
            exclusiveToUser: userId,
            transform: {
                local: TransformUtilities.PanelButtonTransformWrapper(memberAsset.button, tileNumber)
            }
        });

        const ControlActor = this.actorFactory.CreateActor({
            parentId: AnchorActor.id,
            name: `m_${memberAsset.displayName}-control`,
            appearance: {
                enabled: false,
            },
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.Hologram,
                enabled: false
            },
            exclusiveToUser: userId,
            transform: {
                local: TransformUtilities.PanelControlWidthWrapper(controlAsset.memberMenu, tileNumber)
            }
        }, 'transformButtons', controlAsset);

        const ControlButtons = EnumUtilities.getEnumKeyIterable(CustomAssetTransformType).map((_key, index) => {
            const controlButtonMesh = this.assetManager.createButtonMesh(`m_${assetKey}-control-${index}`);
            const controlButtonTransform = controlAsset.buttons[index];

            const controlButton = this.actorFactory.CreateButton({
                parentId: ControlActor.id,
                name: `m_${userId.toString()}-${assetKey}-control-button-${index}`,
                appearance: {
                    enabled: false,
                    meshId: controlButtonMesh.id,
                    materialId: this.assetManager.materialIds['transparent-magenta'],
                },
                exclusiveToUser: userId,
                collider: {
                    geometry: { shape: ColliderType.Auto },
                    layer: CollisionLayer.UI,
                    enabled: false
                },
                transform: {
                    local: TransformUtilities.TransformWrapper(controlButtonTransform)
                }
            });
            controlButton.setBehavior(null);

            return controlButton;
        });

        const panelTile: PanelTile = {
            AnchorActor,
            AnchorDebugger,
            AssetActor,
            AssetButton,
            ControlActor,
            ControlButtons
        };

        return panelTile;
    }
}

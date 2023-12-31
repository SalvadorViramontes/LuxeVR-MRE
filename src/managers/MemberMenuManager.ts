import {
    Actor,
    ButtonBehavior,
    ColliderType,
    CollisionLayer,
    Context,
    Guid,
    User
} from "@microsoft/mixed-reality-extension-sdk";
import AssetManager from "./AssetManager";
import AsyncMap from "../models/AsyncMap";
import LogHelper from "../helpers/LogHelper";
import { Message } from "../contracts/Message";
import TileHelper from "../helpers/TileHelper";
import { PanelTile } from "../models/PanelTile";
import { MemberMenu } from "../types/MemberMenu";
import EnumUtilities from "../utils/EnumUtilities";
import MessageBroker from "../models/MessageBroker";
import RepositoryManager from "./RepositoryManager";
import ActorFactory from "../factories/ActorFactory";
import { GroupMaskManager } from "./GroupMaskManager";
import MessageTrader from "../contracts/MessageTrader";
import { PageDirection } from "../enums/PageDirection";
import { CatchAll } from "../decorators/CatchDecorator";
import { ShowAssetStatus } from "../enums/ShowAssetStatus";
import UserMembershipManager from "./UserMembershipManager";
import { PanelButtonsType } from "../types/PanelButtonsType";
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import MemberMenuService from "../services/MemberMenuService";
import { TransformUtilities } from "../utils/TransformUtilities";
import MemberAssetMapService from "../services/MemberAssetMapService";
import { CustomAssetTransformType } from "../enums/CustomAssetTransformType";
import { TransformButtons } from "../models/TransformButtons";
import { JsUtilities } from "../utils/JsUtilities";

@CatchAll((err) => console.trace(err))
export default class MemberMenuManager extends MessageTrader {
    private userMemberMenuMap: AsyncMap<Guid, MemberMenu> = new AsyncMap<Guid, MemberMenu>();

    constructor(
        protected context: Context,
        protected logHelper: LogHelper,
        protected messageBroker: MessageBroker,
        protected assetManager: AssetManager,
        protected memberMenuService: MemberMenuService,
        protected userMembershipManager: UserMembershipManager,
        protected groupMaskManager: GroupMaskManager,
        protected actorFactory: ActorFactory,
        protected tileHelper: TileHelper,
        protected memberAssetMapService: MemberAssetMapService,
        protected repositoryManager: RepositoryManager
    ) {
        super('member-menu', messageBroker);
    }

    // #region Subscription
    Update<User>(message: Message<User>): void {
        const user = message.payload as unknown as MRE.User;
        if (message.type === 'new-member') {
            this.generateMenu(user);
        } else if (message.type === 'bye-member') {
            this.deleteMenu(user);
        } else if (message.type === 'show-member-menu') {
            this.toggleMemberAssetsVisibility(user, ShowAssetStatus.Open);
        } else if (message.type === 'hide-member-menu') {
            this.toggleMemberAssetsVisibility(user, ShowAssetStatus.Closed);
        } else {
            return;
        }
    }
    // #endregion

    public async menuItems(): Promise<string[]> {
        const publicWearableAssets = await this.repositoryManager.wearableAssetsRepository.readAllByField('type', 'member');
        return publicWearableAssets.map(wearableAsset => wearableAsset.assetKey);
    }

    private async generateVrControlAssets(userId: Guid): Promise<Actor> {
        this.logHelper.info('member-menu-manager', 'Generating VR Member Assets');
        const vrAsset = await this.repositoryManager.vrButtonRepository.readUnique();
        const vrButtonMesh = this.assetManager.createCylinderMesh('vr');

        const mainVrMemberButton = this.actorFactory.CreateButton({
            parentId: this.assetManager.baseActor.id,
            name: `VR member button`,
            appearance: {
                meshId: vrButtonMesh.id,
                materialId: this.assetManager.materialIds['transparent'],
            },
            exclusiveToUser: userId,
            transform: {
                local: TransformUtilities.TransformWrapper(vrAsset.button)
            },
            collider: { geometry: { shape: ColliderType.Auto } },
            attachment: {
                attachPoint: vrAsset.attachmentPoint,
                userId
            }
        });

        mainVrMemberButton.setBehavior(ButtonBehavior).onClick(async user => {
            const memberMenu = await this.memberMenuService.getUserMemberMenu(user.id);
            this.logHelper.userAction(user, `Clicked Member VR Button - Toogle Visibility ${!memberMenu.ShowAssets}`);
            await this.toggleMemberAssetsVisibility(user);
        });
        this.logHelper.info('member-menu-manager', 'Generated VR Member Assets');

        return mainVrMemberButton;
    }

    private async generatePanelAssets(user: User) {
        this.logHelper.info('member-menu-manager', 'Generating Panel Asset');
        const panelAsset = await this.repositoryManager.memberPanelRepository.readUnique();

        const PanelAnchor = this.actorFactory.CreateActor({
            parentId: this.assetManager.baseActor.id,
            name: `${user.id}-anchor-panel`,
            transform: {
                local: TransformUtilities.TransformWrapper(panelAsset.wearable)
            },
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.UI,
                enabled: false,
            },
            exclusiveToUser: user.id,
            attachment: {
                attachPoint: panelAsset.attachmentPoint,
                userId: user.id
            }
        })

        const PanelActor = this.actorFactory.CreateActor({
            parentId: this.assetManager.baseActor.id,
            name: panelAsset.displayName,
            transform: {
                local: TransformUtilities.TransformWrapper(panelAsset.wearable)
            },
            appearance: {
                enabled: false,
            },
            exclusiveToUser: user.id,
            collider: {
                geometry: { shape: ColliderType.Box },
                layer: CollisionLayer.Hologram,
                enabled: false,
            },
            rigidBody: {
                detectCollisions: false,
                useGravity: false,
            },
            attachment: {
                attachPoint: panelAsset.attachmentPoint,
                userId: user.id
            }
        }, 'panel', panelAsset);

        this.logHelper.info('member-menu-manager', 'Generated Panel Asset');

        return {
            Anchor: PanelAnchor,
            Actor: PanelActor
        };
    }

    private async generateControlButtons(userId: Guid, panelActor: Actor): Promise<PanelButtonsType> {
        this.logHelper.info('member-menu-manager', 'Generating Panel Buttons');
        const upButtonAssetPromise = this.repositoryManager.panelButtonsRepository.readByField('name', 'paginationUp');
        await JsUtilities.delay(10);
        const downButtonAssetPromise = this.repositoryManager.panelButtonsRepository.readByField('name', 'paginationDown');
        await JsUtilities.delay(10);
        const closeButtonAssetPromise = this.repositoryManager.panelButtonsRepository.readByField('name', 'panelClose');
        
        const [upButtonAsset, downButtonAsset, closeButtonAsset] = await Promise.all([
            upButtonAssetPromise,
            downButtonAssetPromise,
            closeButtonAssetPromise
        ]);

        const upButtonMesh = this.assetManager.createButtonMesh(`${userId}-page-up`);
        const downButtonMesh = this.assetManager.createButtonMesh(`${userId}-page-down`);
        const closeButtonMesh = this.assetManager.createButtonMesh(`${userId}-panel-close`);

        const Up = this.actorFactory.CreateButton({
            parentId: panelActor.id,
            name: `${userId}-panel-page-up`,
            appearance: {
                enabled: false,
                meshId: upButtonMesh.id,
                materialId: this.assetManager.materialIds['transparent-red'],
            },
            exclusiveToUser: userId,
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.UI,
                enabled: false
            },
            transform: {
                local: TransformUtilities.TransformWrapper(upButtonAsset.button)
            }
        });

        const Down = this.actorFactory.CreateButton({
            parentId: panelActor.id,
            name: `${userId}-panel-page-down`,
            appearance: {
                enabled: false,
                meshId: downButtonMesh.id,
                materialId: this.assetManager.materialIds['transparent-green'],
            },
            exclusiveToUser: userId,
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.UI,
                enabled: false
            },
            transform: {
                local: TransformUtilities.TransformWrapper(downButtonAsset.button)
            }
        });

        const Close = this.actorFactory.CreateButton({
            parentId: panelActor.id,
            name: `${userId}-panel-close`,
            appearance: {
                enabled: false,
                meshId: closeButtonMesh.id,
                materialId: this.assetManager.materialIds['transparent-blue'],
            },
            exclusiveToUser: userId,
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.UI,
                enabled: false
            },
            transform: {
                local: TransformUtilities.TransformWrapper(closeButtonAsset.button)
            }
        });

        Close.setBehavior(ButtonBehavior).onClick(async (aUser: User) => {
            this.logHelper.userAction(aUser, `Clicked Panel Button - Set Visibility false`);
            await this.toggleMemberAssetsVisibility(aUser, ShowAssetStatus.Closed);
        });

        this.logHelper.info('member-menu-manager', 'Generated Panel Buttons');

        return {
            Up,
            Down,
            Close
        };
    }

    private async generateTiles(user: User, panelActor: Actor, controlAsset: TransformButtons, page = 1): Promise<PanelTile[]> {
        this.logHelper.info('member-menu-manager', 'Generating Panel Tiles');
        const menuItems = await this.memberAssetMapService.GetMemberAssets(user, page);
        const panelTiles: PanelTile[] = menuItems.map((memberAsset, index) => {
            const tile = this.tileHelper.createPanelTile(user.id, panelActor, controlAsset, memberAsset, index);
            return tile;
        });

        this.logHelper.info('member-menu-manager', 'Generated Panel Tiles');
        return panelTiles;
    }

    public async generateMenu(user: User): Promise<void> {
        this.logHelper.info('member-menu-manager', `Creating member menu for user ${user.name}`);
        const VrButton = await this.generateVrControlAssets(user.id);
        const PanelAssets = await this.generatePanelAssets(user);
        const PanelButtons = await this.generateControlButtons(user.id, PanelAssets.Anchor);
        const controlAsset = await this.repositoryManager.transformButtonsRepository.readUnique();
        const PanelTiles = await this.generateTiles(user, PanelAssets.Anchor, controlAsset, 1);
        
        const memberMenu: MemberMenu = {
            MemberId: user.id,
            ShowAssets: false,
            VrButton,
            Page: 1,
            PanelAssets,
            PanelButtons,
            PanelTiles
        };
        
        this.logHelper.info('member-menu-manager', `Created member menu for user ${user.name}`);
        await this.memberMenuService.setUserMemberMenu(user.id, memberMenu);
    }

    public async updatePageNumber(aUser: User, panel: Actor, memberMenu: MemberMenu, pageDirection: PageDirection): Promise<void> {
        await this.deleteTiles(aUser);
        const controlAsset = await this.repositoryManager.transformButtonsRepository.readUnique();
        memberMenu.Page = (pageDirection === PageDirection.Next) ? memberMenu.Page + 1 : memberMenu.Page - 1;
        memberMenu.PanelTiles = await this.generateTiles(aUser, panel, controlAsset, memberMenu.Page);
        this.logHelper.userAction(aUser, `Clicked Panel Button - Go to page ${memberMenu.Page}`);
        await this.memberMenuService.setUserMemberMenu(aUser.id, memberMenu);
        await this.updatePaginationButtons(aUser, panel, memberMenu);
        await this.updatePanelTiles(aUser, memberMenu);
    }

    private async updatePaginationButtons(user: User, panel: Actor, memberMenu: MemberMenu): Promise<void> {
        memberMenu.PanelButtons.Up.appearance.enabled = memberMenu.ShowAssets;
        memberMenu.PanelButtons.Up.collider.enabled = memberMenu.ShowAssets;

        memberMenu.PanelButtons.Down.appearance.enabled = memberMenu.ShowAssets;
        memberMenu.PanelButtons.Down.collider.enabled = memberMenu.ShowAssets;
        
        if (memberMenu.ShowAssets) {
            const allMemberAssets = await this.memberAssetMapService.GetMemberAssets(user);
            const totalPages = Math.ceil(allMemberAssets.length/6);
            
            if(memberMenu.Page < totalPages && totalPages > 1){
                memberMenu.PanelButtons.Up.setBehavior(ButtonBehavior).onClick(async (aUser: User) => {
                    await this.updatePageNumber(aUser, panel, memberMenu, PageDirection.Next);
                });
            } else {
                memberMenu.PanelButtons.Up.appearance.enabled = false;
                memberMenu.PanelButtons.Up.setBehavior(null);
            }
            
            if(memberMenu.Page > 1 && totalPages > 1) {
                memberMenu.PanelButtons.Down.setBehavior(ButtonBehavior).onClick(async (aUser: User) => {
                    await this.updatePageNumber(aUser, panel, memberMenu, PageDirection.Previous);
                });
            } else {
                memberMenu.PanelButtons.Down.appearance.enabled = false;
                memberMenu.PanelButtons.Down.setBehavior(null);
            }
        } else {
            memberMenu.PanelButtons.Up.setBehavior(null);
            memberMenu.PanelButtons.Down.setBehavior(null);
        }

        await this.memberMenuService.setUserMemberMenu(user.id, memberMenu);
    }

    private async updatePanelTiles(user: User, memberMenu: MemberMenu) {
        const memberAssets = await this.memberAssetMapService.GetMemberAssets(user, memberMenu.Page);
        memberAssets.map(memberAsset => memberAsset.assetKey).forEach((assetKey, index) => {
            const panelTile = memberMenu.PanelTiles[index];
            panelTile.AnchorActor.appearance.enabled = memberMenu.ShowAssets;
            if (panelTile.AnchorDebugger) {
                panelTile.AnchorDebugger.appearance.enabled = memberMenu.ShowAssets;
            }
            panelTile.AssetActor.appearance.enabled = memberMenu.ShowAssets;

            panelTile.AssetButton.appearance.enabled = memberMenu.ShowAssets;
            panelTile.AssetButton.collider.enabled = memberMenu.ShowAssets;

            panelTile.ControlActor.appearance.enabled = memberMenu.ShowAssets;
            panelTile.ControlButtons.forEach(controlButton => {
                controlButton.appearance.enabled = memberMenu.ShowAssets;
                controlButton.collider.enabled = memberMenu.ShowAssets;
            });

            if (memberMenu.ShowAssets) {
                panelTile.AssetButton.setBehavior(ButtonBehavior).onClick(async (aUser: User) => {
                    await this.assetManager.wearLogic(aUser, assetKey);
                });

                const transformTypes = EnumUtilities.getEnumKeyIterable(CustomAssetTransformType);
                panelTile.ControlButtons.forEach((controlButton, aIndex) => {
                    controlButton.setBehavior(ButtonBehavior).onClick(async (aUser: User) => {
                        const transformType = transformTypes[aIndex];
                        if(!await this.assetManager.hasThisAsset(aUser.id, assetKey)) { return; }
                        
                        this.logHelper.userAction(aUser, `Clicked ${assetKey} to ${transformType} resource`);
                        await this.assetManager.modifyAssetTransform(aUser, assetKey, transformType as unknown as CustomAssetTransformType);
                    });
                });
            } else {
                panelTile.AssetButton.setBehavior(null);
                panelTile.ControlButtons.forEach(controlButton => controlButton.setBehavior(null));
            }
            this.memberMenuService.setUserMemberMenu(user.id, memberMenu);
        });
    }

    private async toggleMemberAssetsVisibility(user: User, isOpen?: ShowAssetStatus): Promise<void> {
        const memberMenu = await this.memberMenuService.getUserMemberMenu(user.id);
        memberMenu.ShowAssets = isOpen ? JSON.parse(isOpen) : !memberMenu.ShowAssets;

        memberMenu.PanelAssets.Actor.appearance.enabled = memberMenu.ShowAssets;
        memberMenu.PanelAssets.Actor.collider.enabled = memberMenu.ShowAssets;
        memberMenu.PanelButtons.Close.appearance.enabled = memberMenu.ShowAssets;
        memberMenu.PanelButtons.Close.collider.enabled = memberMenu.ShowAssets;

        await this.memberMenuService.setUserMemberMenu(user.id, memberMenu);

        await this.updatePaginationButtons(user, memberMenu.PanelAssets.Anchor, memberMenu);
        await this.updatePanelTiles(user, memberMenu);
    }

    private async deleteVrControl(user: User): Promise<void> {
        const memberMenu = await this.memberMenuService.getUserMemberMenu(user.id);
        if (!memberMenu) { return; }
        this.logHelper.info('member-menu-manager', `Deleting member badge for user ${user.name}`);

        memberMenu.VrButton?.destroy();
        memberMenu.VrButton = null;

        await this.memberMenuService.setUserMemberMenu(user.id, memberMenu);
    }

    private async deleteTiles(user: User): Promise<void> {
        const memberMenu = await this.memberMenuService.getUserMemberMenu(user.id);
        if (!memberMenu) { return; }
        this.logHelper.info('member-menu-manager', `Deleting member panel tiles for user ${user.name}`, 4);

        memberMenu.PanelTiles.forEach(panelTile => {
            panelTile.AnchorActor.destroy();
            if(panelTile.AnchorDebugger){
                panelTile.AnchorDebugger.destroy();
            }
            panelTile.AssetActor.destroy();
            panelTile.AssetButton.destroy();
            panelTile.ControlActor.destroy();
            panelTile.ControlButtons.forEach((controlButton) => {
                controlButton.destroy();
            });
        })

        await this.memberMenuService.setUserMemberMenu(user.id, memberMenu);
    }

    private async deletePanelAndButtons(user: User): Promise<void> {
        const memberMenu = await this.memberMenuService.getUserMemberMenu(user.id);
        if (!memberMenu) { return; }
        this.logHelper.info('member-menu-manager', `Deleting member panel for user ${user.name}`);

        memberMenu.PanelAssets.Anchor.destroy();
        memberMenu.PanelAssets.Actor.destroy();
        memberMenu.PanelAssets = null;

        memberMenu.PanelButtons.Up.destroy();
        memberMenu.PanelButtons.Down.destroy();
        memberMenu.PanelButtons.Close.destroy();
        memberMenu.PanelButtons = null;

        await this.memberMenuService.setUserMemberMenu(user.id, memberMenu);
    }

    private async deleteMenu(user: User): Promise<void> {
        await this.deleteVrControl(user);
        await this.deleteTiles(user);
        await this.deletePanelAndButtons(user);
        await this.userMemberMenuMap.delete(user.id);
    }
}

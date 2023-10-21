import {
    Actor,
    ButtonBehavior,
    ColliderType,
    CollisionLayer,
    Context,
    DialogResponse
} from "@microsoft/mixed-reality-extension-sdk";
import AssetManager from "./AssetManager";
import LogHelper from "../helpers/LogHelper";
import { Message } from "../contracts/Message";
import ArtifactManager from "./ArtifactManager";
import EnumUtilities from "../utils/EnumUtilities";
import MessageBroker from "../models/MessageBroker";
import ActorFactory from "../factories/ActorFactory";
import { GroupMaskManager } from "./GroupMaskManager";
import MessageTrader from "../contracts/MessageTrader";
import { CatchAll } from "../decorators/CatchDecorator";
import UserMembershipManager from "./UserMembershipManager";
import MemberMenuService from "../services/MemberMenuService";
import { TransformUtilities } from "../utils/TransformUtilities";
import { REGEXP_VALUES } from "../constants/configuration/regExpValues";
import ActorCustomTransformManager from "./ActorCustomTransformManager";
import { CustomAssetTransformType } from "../enums/CustomAssetTransformType";
import { MenuAssetDescriptor } from "../types/descriptors/MenuAssetDescriptor";
import { PublicMenuDescriptor } from "../types/descriptors/PublicMenuDescriptor";
import { memberRequirements } from "../constants/configuration/memberRequirements";
import { PublicMenuAssetDescriptor } from "../types/descriptors/PublicMenuAssetDescriptor";
import { TransformControlDescriptor } from "../types/descriptors/TransformControlDescription";

@CatchAll((err) => console.trace(err))
export default class PublicMenuManager extends MessageTrader {
    private mainMenu: Actor;
    private mainButton: Actor;
    private desktopMemberButton: Actor;
    private showAssets = false;
    public menuActors: Record<string, Actor> = {};
    public menuButtons: Record<string, Actor> = {};
    
    constructor(
        protected context: Context,
        protected logHelper: LogHelper,
        protected messageBroker: MessageBroker,
        protected assetManager: AssetManager,
        protected memberMenuService: MemberMenuService,
        protected userMembershipManager: UserMembershipManager,
        protected groupMaskManager: GroupMaskManager,
        protected actorFactory: ActorFactory,
        protected artifactManager: ArtifactManager,
        protected actorCustomTransformManager: ActorCustomTransformManager
    ) {
        super('public-menu', messageBroker);
    }

    // #region Subscription
    Update<User>(_message: Message<User>): void {
        return;
    }
    // #endregion

    public menuItems(): string[] {
        return Object.keys(this.assetManager.publicAssets)
            .filter(publicAssetKey => publicAssetKey !== 'main');
    }

    private generateMainAssets() {
        this.logHelper.info('public-menu-manager', 'Generating Main Assets');
        const mainAsset = this.assetManager.publicAssets['main'] as PublicMenuDescriptor;
        const mainButtonMesh = this.assetManager.createButtonMesh('main');

        this.mainMenu = this.actorFactory.CreateActor({
            parentId: this.assetManager.baseActor.id,
            name: mainAsset.displayName,
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.Navigation,
                enabled: false
            },
            transform: {
                local: TransformUtilities.TransformWrapper(mainAsset.menu)
            }
        }, 'main', mainAsset);

        this.mainButton = this.actorFactory.CreateButton({
            parentId: this.assetManager.baseActor.id,
            name: `Main button`,
            appearance: {
                meshId: mainButtonMesh.id,
                materialId: this.assetManager.materialIds['transparent'],
            },
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.UI,
                enabled: true
            },
            transform: {
                local: TransformUtilities.TransformWrapper(mainAsset.mainButton)
            }
        });

        this.desktopMemberButton = this.actorFactory.CreateButton({
            parentId: this.assetManager.baseActor.id,
            name: `Desktop member button`,
            appearance: {
                meshId: mainButtonMesh.id,
                materialId: this.assetManager.materialIds['transparent-red'],
            },
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.UI,
                enabled: true
            },
            transform: {
                local: TransformUtilities.TransformWrapper(mainAsset.desktopMemberButton)
            }
        })

        this.mainButton.setBehavior(ButtonBehavior).onClick(user => {
            this.logHelper.userAction(user, `Clicked Main Drawer - Toogle Public Assets Visibility ${!this.showAssets}`);
            this.TogglePublicAssetsVisibility();
        });

        this.desktopMemberButton.setBehavior(ButtonBehavior).onClick(async user => {
            const userIsMember = await this.userMembershipManager.IsMember(user.id);

            if(userIsMember){   
                const memberMenu = await this.memberMenuService.getUserMemberMenu(user.id);
                this.logHelper.userAction(user, `Clicked Desktop Membership Drawer - Toogle Member Assets Visibility ${!memberMenu.ShowAssets}`);
                
                this.SendMessage({
                    type: !memberMenu.ShowAssets ? 'show-member-menu' : 'hide-member-menu',
                    payload: user
                }, 'member-menu');
            } else {
                this.logHelper.userAction(user, `Clicked Membership Info Drawer`);
                const displayText = memberRequirements;
                let dialogRequest: Promise<DialogResponse>;
                let validEmail = false;
                
                dialogRequest = user.prompt(displayText, true);
                
                while(!validEmail){
                    const dialogResponse = await dialogRequest;
                    if(!dialogResponse.submitted) { break; }
                    
                    const emailRegex = REGEXP_VALUES.Email.exec(String(dialogResponse.text).toLowerCase());
                    validEmail = !!emailRegex;
                    
                    if(validEmail) { 
                        this.logHelper.userAction(user, `Requested MRE Membership with email: ${emailRegex[0]}`);
                        break; 
                    }

                    dialogRequest = user.prompt('Submitted email is not valid, try again', true);
                }
            }
        });

        this.logHelper.info('public-menu-manager', 'Generated Main Assets');
    }

    private TogglePublicAssetsVisibility() {
        this.showAssets = !this.showAssets;

        this.menuItems().forEach((assetKey) => {
            const transformTypes = EnumUtilities.getEnumKeyIterable(CustomAssetTransformType);
            const assetActor = this.menuActors[assetKey];
            const assetButton = this.menuButtons[assetKey];
            const controlActor = this.menuActors[`${assetKey}-control`];
            const controlButtons = transformTypes.map((_type, index) => {
                return this.menuButtons[`${assetKey}-control-button-${index}`];
            })

            assetActor.appearance.enabled = this.showAssets;
            assetButton.appearance.enabled = this.showAssets;
            assetButton.collider.enabled = this.showAssets;
            controlActor.appearance.enabled = this.showAssets;
            controlButtons.forEach(controlButton => controlButton.appearance.enabled = this.showAssets);

            if(this.showAssets) {
                assetButton.setBehavior(ButtonBehavior).onClick(async user => {
                    await this.assetManager.wearLogic(user, assetKey);
                });
                transformTypes.map((type, index) => {
                    const controlButton = this.menuButtons[`${assetKey}-control-button-${index}`];
                    controlButton.collider.enabled = true;
                    controlButton.setBehavior(ButtonBehavior).onClick(async user => {
                        if(!await this.assetManager.hasThisAsset(user.id, assetKey)) { return; }
                        
                        this.logHelper.userAction(user, `Clicked ${assetKey} to ${type} resource`);
                        await this.assetManager.modifyAssetTransform(user, assetKey, type as unknown as CustomAssetTransformType);
                    });
                });
            } else {
                assetButton.setBehavior(null);
                transformTypes.map((_type, index) => {
                    const controlButton = this.menuButtons[`${assetKey}-control-button-${index}`];
                    controlButton.collider.enabled = false;
                    controlButton.setBehavior(null);
                })
            }
        });
    }

    private generateItemAsset(publicAssetKey: string) {
        this.logHelper.info('public-menu-manager', 'Generating Item Assets');
        const publicAsset = this.assetManager.publicAssets[publicAssetKey] as MenuAssetDescriptor;
        const buttonMesh = this.assetManager.createButtonMesh(publicAssetKey);

        const anchorActor = this.actorFactory.CreateActor({
            parentId: this.mainMenu.id,
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.Hologram,
                enabled: false
            },
            transform: {
                local: TransformUtilities.AnchorWrapper(publicAsset.menu.position)
            }
        });
        this.menuActors[`${publicAssetKey}-anchor`] = anchorActor;

        const assetActor = this.actorFactory.CreateActor({
            parentId: anchorActor.id,
            name: publicAsset.displayName,
            appearance: {
                enabled: this.showAssets,
            },
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.Hologram,
                enabled: false
            },
            transform: {
                local: TransformUtilities.LocalAnchorTransform(publicAsset.menu, publicAsset.menu.position)
            }
        }, publicAssetKey, publicAsset);
        this.menuActors[publicAssetKey] = assetActor;

        const assetButton = this.actorFactory.CreateButton({
            parentId: anchorActor.id,
            name: `${publicAssetKey} button`,
            appearance: {
                enabled: this.showAssets,
                meshId: buttonMesh.id,
                materialId: this.assetManager.materialIds['transparent'],
            },
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.UI,
                enabled: false
            },
            transform: {
                local: TransformUtilities.LocalAnchorTransform(publicAsset.button, publicAsset.menu.position)
            }
        });
        assetButton.setBehavior(null);

        this.menuButtons[publicAssetKey] = assetButton;
        this.logHelper.info('public-menu-manager', 'Generated Item Assets');
        this.generateItemControlAssets(publicAssetKey, publicAsset as PublicMenuAssetDescriptor, anchorActor);
    }

    private generateItemControlAssets(
        publicAssetKey: string,
        publicAsset: PublicMenuAssetDescriptor,
        anchorActor: Actor
    ): void {
        this.logHelper.info('public-menu-manager', 'Generating Item Control Assets');
        const controlAsset = this.assetManager.utilityAssets['transformButtons'] as TransformControlDescriptor;
        const controlHeight = publicAsset.controlHeight;
        
        const controlActor = this.actorFactory.CreateActor({
            parentId: anchorActor.id,
            name: `${publicAsset.displayName}-control`,
            appearance: {
                enabled: this.showAssets,
            },
            collider: {
                geometry: { shape: ColliderType.Auto },
                layer: CollisionLayer.Hologram,
                enabled: false
            },
            transform: {
                local: TransformUtilities.LocalControlHeightWrapper(controlAsset.publicMenu, controlHeight)
            }
        }, 'transformButtons', controlAsset);
        this.menuActors[`${publicAssetKey}-control`] = controlActor;

        EnumUtilities.getEnumKeyIterable(CustomAssetTransformType).forEach((_key, index) => {
            const controlButtonMesh = this.assetManager.createButtonMesh(`${publicAssetKey}-control-${index}`);
            const controlButtonTransform = controlAsset.buttons[index];

            const controlButton = this.actorFactory.CreateButton({
                parentId: controlActor.id,
                name: `${publicAssetKey}-control-button-${index}`,
                appearance: {
                    enabled: this.showAssets,
                    meshId: controlButtonMesh.id,
                    materialId: this.assetManager.materialIds['transparent'],
                },
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
            
            this.menuButtons[`${publicAssetKey}-control-button-${index}`] = controlButton;
        });
        this.logHelper.info('public-menu-manager', 'Generated Item Control Assets');
    }

    public generateMenu() {
        this.logHelper.info('public-menu-manager', 'Generating public menu');
        this.generateMainAssets();
        this.menuItems().forEach((publicAssetKey) => {
            this.generateItemAsset(publicAssetKey);
        });
        this.logHelper.info('public-menu-manager', 'Generated public menu');
    }
}

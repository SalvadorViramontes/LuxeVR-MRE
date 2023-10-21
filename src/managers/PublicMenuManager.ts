import {
	Actor,
	ButtonBehavior,
	ColliderType,
	CollisionLayer,
	Context,
	DialogResponse,
} from "@microsoft/mixed-reality-extension-sdk";
import AssetManager from "./AssetManager";
import LogHelper from "../helpers/LogHelper";
import { Message } from "../contracts/Message";
import ArtifactManager from "./ArtifactManager";
import EnumUtilities from "../utils/EnumUtilities";
import { JsUtilities } from "../utils/JsUtilities";
import MessageBroker from "../models/MessageBroker";
import RepositoryManager from "./RepositoryManager";
import ActorFactory from "../factories/ActorFactory";
import { GroupMaskManager } from "./GroupMaskManager";
import MessageTrader from "../contracts/MessageTrader";
import { CatchAll } from "../decorators/CatchDecorator";
import { WearableAsset } from "../models/WearableAsset";
import { REGEXP_VALUES } from "../constants/regExpValues";
import UserMembershipManager from "./UserMembershipManager";
import MemberMenuService from "../services/MemberMenuService";
import PublicMenuService from "../services/PublicMenuService";
import { TransformButtons } from "../models/TransformButtons";
import { TransformUtilities } from "../utils/TransformUtilities";
import { memberRequirements } from "../constants/memberRequirements";
import ActorCustomTransformManager from "./ActorCustomTransformManager";
import { CustomAssetTransformType } from "../enums/CustomAssetTransformType";

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
		protected actorCustomTransformManager: ActorCustomTransformManager,
		protected publicMenuService: PublicMenuService,
		protected repositoryManager: RepositoryManager
	) {
		super("public-menu", messageBroker);
	}

	// #region Subscription
	Update<User>(_message: Message<User>): void {
		return;
	}
	// #endregion

	public async menuItems(): Promise<string[]> {
		const publicWearableAssets =
			await this.repositoryManager.wearableAssetsRepository.readAllByField(
				"type",
				"public"
			);
		return publicWearableAssets.map(
			(wearableAsset) => wearableAsset.assetKey
		);
	}

	private async generateMainAssets() {
		this.logHelper.info("public-menu-manager", "Generating Main Assets");
		const mainAsset =
			await this.repositoryManager.publicMenuRepository.readUnique();
		const mainButtonMesh = this.assetManager.createButtonMesh("main");

		this.mainMenu = this.actorFactory.CreateActor(
			{
				parentId: this.assetManager.baseActor.id,
				name: mainAsset.displayName,
				collider: {
					geometry: { shape: ColliderType.Auto },
					layer: CollisionLayer.Navigation,
					enabled: false,
				},
				transform: {
					local: TransformUtilities.TransformWrapper(mainAsset.menu),
				},
			},
			"main",
			mainAsset
		);

		this.mainButton = this.actorFactory.CreateButton({
			parentId: this.assetManager.baseActor.id,
			name: `Main button`,
			appearance: {
				meshId: mainButtonMesh.id,
				materialId: this.assetManager.materialIds["transparent"],
			},
			collider: {
				geometry: { shape: ColliderType.Auto },
				layer: CollisionLayer.UI,
				enabled: true,
			},
			transform: {
				local: TransformUtilities.TransformWrapper(
					mainAsset.mainButton
				),
			},
		});

		this.desktopMemberButton = this.actorFactory.CreateButton({
			parentId: this.assetManager.baseActor.id,
			name: `Desktop member button`,
			appearance: {
				meshId: mainButtonMesh.id,
				materialId: this.assetManager.materialIds["transparent-red"],
			},
			collider: {
				geometry: { shape: ColliderType.Auto },
				layer: CollisionLayer.UI,
				enabled: true,
			},
			transform: {
				local: TransformUtilities.TransformWrapper(
					mainAsset.desktopMemberButton
				),
			},
		});

		this.mainButton.setBehavior(ButtonBehavior).onClick((user) => {
			this.logHelper.userAction(
				user,
				`Clicked Main Drawer - Toogle Public Assets Visibility ${!this
					.showAssets}`
			);
			this.TogglePublicAssetsVisibility();
		});

		this.desktopMemberButton
			.setBehavior(ButtonBehavior)
			.onClick(async (user) => {
				const userIsMember = await this.userMembershipManager.IsMember(
					user.id
				);

				if (userIsMember) {
					const memberMenu =
						await this.memberMenuService.getUserMemberMenu(user.id);
					this.logHelper.userAction(
						user,
						`Clicked Desktop Membership Drawer - Toogle Member Assets Visibility ${!memberMenu.ShowAssets}`
					);

					this.SendMessage(
						{
							type: !memberMenu.ShowAssets
								? "show-member-menu"
								: "hide-member-menu",
							payload: user,
						},
						"member-menu"
					);
				} else {
					this.logHelper.userAction(
						user,
						`Clicked Membership Info Drawer`
					);
					const displayText = memberRequirements;
					let dialogRequest: Promise<DialogResponse>;
					let validEmail = false;

					dialogRequest = user.prompt(displayText, true);

					while (!validEmail) {
						const dialogResponse = await dialogRequest;
						if (!dialogResponse.submitted) {
							break;
						}

						const emailRegex = REGEXP_VALUES.Email.exec(
							String(dialogResponse.text).toLowerCase()
						);
						validEmail = !!emailRegex;

						if (validEmail) {
							const emailString = emailRegex[0];
							this.logHelper.userAction(
								user,
								`Requested MRE Membership with email: ${emailString}`
							);
							const altspaceUser =
								await this.repositoryManager.altspaceUserRepository.readByField(
									"altspace_id",
									user.id.toString()
								);
							altspaceUser.email = emailString;
							await this.repositoryManager.altspaceUserRepository.update(
								altspaceUser
							);
							break;
						}

						dialogRequest = user.prompt(
							"Submitted email is not valid, try again",
							true
						);
					}
				}
			});

		this.logHelper.info("public-menu-manager", "Generated Main Assets");
	}

	private async TogglePublicAssetsVisibility() {
		this.showAssets = !this.showAssets;

		const menuItems = await this.menuItems();
		const promiseItems = menuItems.map(async (assetKey, index) => {
			await JsUtilities.delay(15 * index);
			const publicMenuItem =
				await this.publicMenuService.getPublicMenuItem(assetKey);

			publicMenuItem.AssetActor.appearance.enabled = this.showAssets;
			publicMenuItem.AssetButton.appearance.enabled = this.showAssets;
			publicMenuItem.AssetButton.collider.enabled = this.showAssets;
			publicMenuItem.ControlActor.appearance.enabled = this.showAssets;

			await this.publicMenuService.setPublicMenuItem(
				assetKey,
				publicMenuItem
			);

			if (this.showAssets) {
				publicMenuItem.AssetButton.setBehavior(ButtonBehavior).onClick(
					async (user) => {
						await this.assetManager.wearLogic(user, assetKey);
					}
				);
				const transformTypes = EnumUtilities.getEnumKeyIterable(
					CustomAssetTransformType
				);
				publicMenuItem.ControlButtons =
					publicMenuItem.ControlButtons.map(
						(controlButton, aIndex) => {
							const transformType = transformTypes[aIndex];
							controlButton.appearance.enabled = true;
							controlButton.collider.enabled = true;
							controlButton
								.setBehavior(ButtonBehavior)
								.onClick(async (user) => {
									if (
										!(await this.assetManager.hasThisAsset(
											user.id,
											assetKey
										))
									) {
										return;
									}

									this.logHelper.userAction(
										user,
										`Clicked ${assetKey} to ${transformType} resource`
									);
									await this.assetManager.modifyAssetTransform(
										user,
										assetKey,
										transformType as unknown as CustomAssetTransformType
									);
								});
							return controlButton;
						}
					);
				await this.publicMenuService.setPublicMenuItem(
					assetKey,
					publicMenuItem
				);
			} else {
				publicMenuItem.AssetButton.setBehavior(null);
				publicMenuItem.ControlButtons =
					publicMenuItem.ControlButtons.map((controlButton) => {
						controlButton.appearance.enabled = false;
						controlButton.collider.enabled = false;
						controlButton.setBehavior(null);
						return controlButton;
					});
				await this.publicMenuService.setPublicMenuItem(
					assetKey,
					publicMenuItem
				);
			}
		});

		await Promise.all(promiseItems);
	}

	private generateItemAsset(publicAsset: WearableAsset): {
		AnchorActor: Actor;
		AssetActor: Actor;
		AssetButton: Actor;
	} {
		this.logHelper.info("public-menu-manager", "Generating Item Assets");
		const buttonMesh = this.assetManager.createButtonMesh(
			publicAsset.assetKey
		);

		const AnchorActor = this.actorFactory.CreateActor({
			parentId: this.mainMenu.id,
			collider: {
				geometry: { shape: ColliderType.Auto },
				layer: CollisionLayer.Hologram,
				enabled: false,
			},
			transform: {
				local: TransformUtilities.AnchorWrapper(
					publicAsset.menu.position
				),
			},
		});

		const AssetActor = this.actorFactory.CreateActor(
			{
				parentId: AnchorActor.id,
				name: publicAsset.displayName,
				appearance: {
					enabled: false,
				},
				collider: {
					geometry: { shape: ColliderType.Auto },
					layer: CollisionLayer.Hologram,
					enabled: false,
				},
				transform: {
					local: TransformUtilities.LocalAnchorTransform(
						publicAsset.menu,
						publicAsset.menu.position
					),
				},
			},
			publicAsset.assetKey,
			publicAsset
		);

		const AssetButton = this.actorFactory.CreateButton({
			parentId: AnchorActor.id,
			name: `${publicAsset.assetKey} button`,
			appearance: {
				enabled: false,
				meshId: buttonMesh.id,
				materialId: this.assetManager.materialIds["transparent"],
			},
			collider: {
				geometry: { shape: ColliderType.Auto },
				layer: CollisionLayer.UI,
				enabled: false,
			},
			transform: {
				local: TransformUtilities.LocalAnchorTransform(
					publicAsset.button,
					publicAsset.menu.position
				),
			},
		});
		AssetButton.setBehavior(null);

		this.logHelper.info("public-menu-manager", "Generated Item Assets");

		return {
			AnchorActor,
			AssetActor,
			AssetButton,
		};
	}

	private generateItemControlAssets(
		publicAsset: WearableAsset,
		controlAsset: TransformButtons,
		anchorActor: Actor
	): { ControlActor: Actor; ControlButtons: Actor[] } {
		this.logHelper.info(
			"public-menu-manager",
			"Generating Item Control Assets"
		);
		const controlHeight = publicAsset.controlHeight;

		const ControlActor = this.actorFactory.CreateActor(
			{
				parentId: anchorActor.id,
				name: `${publicAsset.displayName}-control`,
				appearance: {
					enabled: false,
				},
				collider: {
					geometry: { shape: ColliderType.Auto },
					layer: CollisionLayer.Hologram,
					enabled: false,
				},
				transform: {
					local: TransformUtilities.LocalControlHeightWrapper(
						controlAsset.publicMenu,
						controlHeight
					),
				},
			},
			"transformButtons",
			controlAsset
		);

		const controlButtonMesh = this.assetManager.createButtonMesh(
			`${publicAsset.assetKey}-controls`
		);
		const ControlButtons = EnumUtilities.getEnumKeyIterable(
			CustomAssetTransformType
		).map((_key, index) => {
			const controlButtonTransform = controlAsset.buttons[index];
			const controlButton = this.actorFactory.CreateButton({
				parentId: ControlActor.id,
				name: `${publicAsset.assetKey}-control-button-${index}`,
				appearance: {
					enabled: false,
					meshId: controlButtonMesh.id,
					materialId: this.assetManager.materialIds["transparent"],
				},
				collider: {
					geometry: { shape: ColliderType.Auto },
					layer: CollisionLayer.UI,
					enabled: false,
				},
				transform: {
					local: TransformUtilities.TransformWrapper(
						controlButtonTransform
					),
				},
			});
			controlButton.setBehavior(null);

			return controlButton;
		});
		this.logHelper.info(
			"public-menu-manager",
			"Generated Item Control Assets"
		);
		return {
			ControlActor,
			ControlButtons,
		};
	}

	public async generateMenu() {
		this.logHelper.info("public-menu-manager", "Generating public menu");
		await this.generateMainAssets();
		const menuItems = await this.menuItems();
		const assetPromises = menuItems.map(async (publicAssetKey, index) => {
			await JsUtilities.delay(15 * index);
			const publicAsset =
				await this.repositoryManager.wearableAssetsRepository.readByField(
					"assetKey",
					publicAssetKey
				);
			const { AnchorActor, AssetActor, AssetButton } =
				this.generateItemAsset(publicAsset);
			const controlAsset =
				await this.repositoryManager.transformButtonsRepository.readUnique();
			const { ControlActor, ControlButtons } =
				this.generateItemControlAssets(
					publicAsset,
					controlAsset,
					AnchorActor
				);

			const publicMenu = {
				AnchorActor,
				AssetActor,
				AssetButton,
				ControlActor,
				ControlButtons,
			};
			await this.publicMenuService.setPublicMenuItem(
				publicAssetKey,
				publicMenu
			);
		});
		await Promise.all(assetPromises);

		this.logHelper.info("public-menu-manager", "Generated public menu");
	}
}

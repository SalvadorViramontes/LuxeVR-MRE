import LogHelper from "./helpers/LogHelper";
import TileHelper from "./helpers/TileHelper";
import AssetManager from "./managers/AssetManager";
import MessageBroker from "./models/MessageBroker";
import ActorFactory from "./factories/ActorFactory";
import { LogVerbosity } from "./enums/LogVerbosity";
import PrefabManager from "./managers/PrefabManager";
import { CatchAll } from "./decorators/CatchDecorator";
import ArtifactManager from "./managers/ArtifactManager";
import StrapiApiService from "./services/StrapiApiService";
import AttachmentManager from "./managers/AttachmentManager";
import PublicMenuManager from "./managers/PublicMenuManager";
import MemberMenuManager from "./managers/MemberMenuManager";
import MemberMenuService from "./services/MemberMenuService";
import RepositoryManager from "./managers/RepositoryManager";
import PublicMenuService from "./services/PublicMenuService";
import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { GroupMaskManager } from "./managers/GroupMaskManager";
import { PromiseReject } from "./types/promises/PromiseReject";
import { PromiseResolve } from "./types/promises/PromiseResolve";
import MemberAssetMapService from "./services/MemberAssetMapService";
import UserMembershipManager from "./managers/UserMembershipManager";
import { AssetContainer, User } from "@microsoft/mixed-reality-extension-sdk";
import ActorCustomTransformManager from "./managers/ActorCustomTransformManager";
import { GlobalConfigurationService } from "./services/GlobalConfigurationService";
import CustomAssetTransformHandlerFactory from "./factories/CustomAssetTransformHandlerFactory";

@CatchAll((err) => console.trace(err))
export default class LuxeVrMre {
	public logHelper: LogHelper;
	public tileHelper: TileHelper;
	public actorFactory: ActorFactory;
	public assetManager: AssetManager;
	public prefabManager: PrefabManager;
	public assetContainer: AssetContainer;
	public artifactManager: ArtifactManager;
	public userMessageBroker: MessageBroker;
	public strapiApiService: StrapiApiService;
	public groupMaskManager: GroupMaskManager;
	public attachmentManager: AttachmentManager;
	public memberMenuManager: MemberMenuManager;
	public memberMenuService: MemberMenuService;
	public publicMenuManager: PublicMenuManager;
	public publicMenuService: PublicMenuService;
	public repositoryManager: RepositoryManager;
	public memberAssetMapService: MemberAssetMapService;
	public userMembershipManager: UserMembershipManager;
	public actorCustomTransformManager: ActorCustomTransformManager;
	public customAssetTransformHandlerFactory: CustomAssetTransformHandlerFactory;

	public preloadedAssetsPromise: Promise<void>;
	public preloadedAssetsResolve: PromiseResolve<void>;
	public preloadedAssetsReject: PromiseReject;

	constructor(
		public context: MRE.Context,
		public globalConfigurationService: GlobalConfigurationService
	) {
		this.customAssetTransformHandlerFactory =
			new CustomAssetTransformHandlerFactory();
		this.strapiApiService = new StrapiApiService(
			globalConfigurationService
		);
		this.repositoryManager = new RepositoryManager(
			this.strapiApiService.getInstance()
		);
		this.logHelper = new LogHelper(
			globalConfigurationService,
			this.repositoryManager
		);
		this.publicMenuService = new PublicMenuService();
		this.memberMenuService = new MemberMenuService();
		this.logHelper.info(
			"app",
			`Initializing constructor`,
			LogVerbosity.One
		);
		this.userMessageBroker = new MessageBroker(
			this.logHelper,
			(payload: User) => payload.id.toString()
		);
		this.prefabManager = new PrefabManager(this.logHelper);
		this.artifactManager = new ArtifactManager(this.logHelper);
		this.actorCustomTransformManager = new ActorCustomTransformManager(
			this.logHelper,
			this.customAssetTransformHandlerFactory,
			this.repositoryManager
		);
		this.memberAssetMapService = new MemberAssetMapService(
			this.repositoryManager
		);
		this.assetContainer = new AssetContainer(this.context);
		this.groupMaskManager = new GroupMaskManager(this.context);
		this.attachmentManager = new AttachmentManager(
			this.userMessageBroker,
			this.logHelper
		);
		this.actorFactory = new ActorFactory(this.context, this.prefabManager);

		this.userMembershipManager = new UserMembershipManager(
			this.logHelper,
			this.userMessageBroker,
			this.repositoryManager
		);
		this.assetManager = new AssetManager(
			this.context,
			this.logHelper,
			this.assetContainer,
			this.attachmentManager,
			this.userMembershipManager,
			this.actorFactory,
			this.prefabManager,
			this.artifactManager,
			this.actorCustomTransformManager,
			this.globalConfigurationService,
			this.repositoryManager
		);
		this.tileHelper = new TileHelper(
			this.actorFactory,
			this.assetManager,
			this.globalConfigurationService
		);
		this.publicMenuManager = new PublicMenuManager(
			this.context,
			this.logHelper,
			this.userMessageBroker,
			this.assetManager,
			this.memberMenuService,
			this.userMembershipManager,
			this.groupMaskManager,
			this.actorFactory,
			this.artifactManager,
			this.actorCustomTransformManager,
			this.publicMenuService,
			this.repositoryManager
		);
		this.memberMenuManager = new MemberMenuManager(
			this.context,
			this.logHelper,
			this.userMessageBroker,
			this.assetManager,
			this.memberMenuService,
			this.userMembershipManager,
			this.groupMaskManager,
			this.actorFactory,
			this.tileHelper,
			this.memberAssetMapService,
			this.repositoryManager
		);

		this.context.onStarted(() => this.extensionStart());
		this.context.onUserJoined((user) => this.userJoined(user));
		this.context.onUserLeft((user) => this.userLeft(user));

		this.preloadedAssetsPromise = new Promise((resolve, reject) => {
			this.preloadedAssetsResolve = resolve;
			this.preloadedAssetsReject = reject;
		});

		this.logHelper.info("app", `Finishing constructor`, LogVerbosity.Two);
	}

	private async extensionStart() {
		const delay = 1000;
		this.logHelper.info(
			"app",
			`Extension running mode: ${
				this.globalConfigurationService.isDebug ? "debug" : "prod"
			}`,
			LogVerbosity.One
		);
		this.logHelper.info(
			"app",
			`Log verbosity: ${this.globalConfigurationService.logVerbosity}`,
			LogVerbosity.One
		);

		if (this.globalConfigurationService.isDebug) {
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
		const deltaTransformValues =
			await this.repositoryManager.deltaTransformValuesRepository.readUnique();
		this.customAssetTransformHandlerFactory.deltaTransformValues =
			deltaTransformValues;
		await this.startLogic();
	}

	private startLogic = async () => {
		await this.assetManager.preloadAssets();
		this.preloadedAssetsResolve();
		await this.publicMenuManager.generateMenu();
	};

	private async userJoined(user: User) {
		await this.preloadedAssetsPromise;
		await this.userMembershipManager.AddUser(user);
	}

	private async userLeft(user: User) {
		await this.preloadedAssetsPromise;
		await this.assetManager.removeAllAssets(user);
		await this.userMembershipManager.RemoveUser(user);
	}
}

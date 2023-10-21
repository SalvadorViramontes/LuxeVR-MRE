import { AxiosInstance } from "axios";
import { CatchAll } from "../decorators/CatchDecorator";
import VrButtonRepository from "../api/repositories/VrButtonRepository";
import PublicMenuRepository from "../api/repositories/PublicMenuRepository";
import MemberPanelRepository from "../api/repositories/MemberPanelRepository";
import AltspaceUserRepository from "../api/repositories/AltspaceUserRepository";
import PanelButtonsRepository from "../api/repositories/PanelButtonsRepository";
import MemberAssetsRepository from "../api/repositories/MemberAssetsRepository";
import UserActionLogsRepository from "../api/repositories/UserActionLogsRepository";
import WearableAssetsRepository from "../api/repositories/WearableAssetsRepository";
import TransformButtonsRepository from "../api/repositories/TransformButtonsRepository";
import DeltaTransformValuesRepository from "../api/repositories/DeltaTransformValuesRepository";
import UserCustomAssetTransformsRepository from "../api/repositories/UserCustomAssetTransformsRepository";

@CatchAll((err) => console.trace(err))
export default class RepositoryManager {
    public altspaceUserRepository: AltspaceUserRepository;
    public deltaTransformValuesRepository: DeltaTransformValuesRepository;
    public memberAssetsRepository: MemberAssetsRepository;
    public memberPanelRepository: MemberPanelRepository;
    public panelButtonsRepository: PanelButtonsRepository;
    public publicMenuRepository: PublicMenuRepository;
    public transformButtonsRepository: TransformButtonsRepository;
    public userActionLogsRepository: UserActionLogsRepository;
    public userCustomAssetTransformsRepository: UserCustomAssetTransformsRepository;
    public vrButtonRepository: VrButtonRepository;
    public wearableAssetsRepository: WearableAssetsRepository;
    
    constructor(instance: AxiosInstance){
        this.altspaceUserRepository = new AltspaceUserRepository(instance);
        this.deltaTransformValuesRepository = new DeltaTransformValuesRepository(instance);
        this.memberAssetsRepository = new MemberAssetsRepository(instance);
        this.memberPanelRepository = new MemberPanelRepository(instance);
        this.panelButtonsRepository = new PanelButtonsRepository(instance);
        this.publicMenuRepository = new PublicMenuRepository(instance);
        this.transformButtonsRepository = new TransformButtonsRepository(instance);
        this.userActionLogsRepository = new UserActionLogsRepository(instance);
        this.userCustomAssetTransformsRepository = new UserCustomAssetTransformsRepository(instance);
        this.vrButtonRepository = new VrButtonRepository(instance);
        this.wearableAssetsRepository = new WearableAssetsRepository(instance);
    }
}

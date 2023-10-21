import { StrapiModel } from "./_StrapiModel";
import { AltspaceUserDTO } from "./AltspaceUser.dto";
import { WearableAssetDTO } from "./WearableAsset.dto";

export interface MemberAssetsDTO {
    altspace_user: StrapiModel<Partial<AltspaceUserDTO>>;
    wearable_assets: Array<StrapiModel<Partial<WearableAssetDTO>>>;
}

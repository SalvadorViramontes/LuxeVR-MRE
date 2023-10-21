import { StrapiModel } from "./_StrapiModel";
import { AltspaceUserDTO } from "./AltspaceUser.dto";
import { WearableAssetDTO } from "./WearableAsset.dto";
import { AssetTransform } from "../../types/descriptors/AssetTransform";

export interface UserCustomAssetTransformsDTO {
    altspace_user: StrapiModel<AltspaceUserDTO>;
    wearable_asset: StrapiModel<WearableAssetDTO>;
    customAssetTransform: AssetTransform;
}

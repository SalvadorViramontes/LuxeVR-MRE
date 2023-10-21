import { Model } from "./_Model";
import { AltspaceUser } from "./AltspaceUser";
import { WearableAsset } from "./WearableAsset";
import { AssetTransform } from "../types/descriptors/AssetTransform";

export interface UserCustomAssetTransforms extends Model {
    altspaceUser: AltspaceUser;
    wearableAsset: WearableAsset;
    customAssetTransform: AssetTransform;
}

import { AssetTransform } from "../../types/descriptors/AssetTransform";

export interface WearableAssetDTO {
    displayName: string;
    resourceName: string;
    controlHeight?: number;
    attachmentPoint: string;
    assetKey: string;
    type: string;
    menu: AssetTransform;
    button: AssetTransform;
    wearable: AssetTransform;
}

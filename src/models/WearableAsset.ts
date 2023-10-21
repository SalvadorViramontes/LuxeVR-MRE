import { Model } from "./_Model";
import { AttachmentPoint } from "../enums/AttachmentPoint";
import { AssetTransform } from "../types/descriptors/AssetTransform";

export interface WearableAsset extends Model {
    displayName: string;
    resourceName: string;
    controlHeight?: number;
    attachmentPoint: AttachmentPoint;
    assetKey: string;
    type: string;
    menu: AssetTransform;
    button: AssetTransform;
    wearable: AssetTransform;
}

import { AssetTransform } from "./AssetTransform";
import { AssetDescriptor } from "./AssetDescriptor";
import { AttachmentPoint } from "../../enums/AttachmentPoint";

export type WearableAssetDescriptor = AssetDescriptor & {
    attachmentPoint: AttachmentPoint;
    wearable: AssetTransform;
}

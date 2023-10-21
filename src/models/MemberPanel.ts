import { Model } from "./_Model";
import { AttachmentPoint } from "../enums/AttachmentPoint";
import { AssetTransform } from "../types/descriptors/AssetTransform";

export interface MemberPanel extends Model {
    displayName: string;
    resourceName: string;
    attachmentPoint: AttachmentPoint;
    wearable: AssetTransform;
}

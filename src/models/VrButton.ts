import { Model } from "./_Model";
import { AttachmentPoint } from "../enums/AttachmentPoint";
import { AssetTransform } from "../types/descriptors/AssetTransform";

export interface VrButton extends Model {
    displayName: string;
    resourceName: string;
    attachmentPoint: AttachmentPoint;
    button: AssetTransform;
}

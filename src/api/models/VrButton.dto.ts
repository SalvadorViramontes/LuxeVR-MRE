import { AssetTransform } from "../../types/descriptors/AssetTransform";

export interface VrButtonDTO {
    displayName: string;
    resourceName: string;
    attachmentPoint: string;
    button: AssetTransform;
}

import { AssetTransform } from "../../types/descriptors/AssetTransform";

export interface MemberPanelDTO {
    displayName: string;
    resourceName: string;
    attachmentPoint: string;
    wearable: AssetTransform;
}

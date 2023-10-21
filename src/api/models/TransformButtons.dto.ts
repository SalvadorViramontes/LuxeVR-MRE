import { AssetTransform } from "../../types/descriptors/AssetTransform";

export interface TransformButtonsDTO {
    displayName: string;
    resourceName: string;
    publicMenu: AssetTransform;
    memberMenu: AssetTransform;
    buttons: AssetTransform[];
}

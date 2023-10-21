import { AssetTransform } from "../../types/descriptors/AssetTransform";

export interface PublicMenuDTO {
    displayName: string;
    resourceName: string;
    menu: AssetTransform;
    mainButton: AssetTransform;
    desktopMemberButton: AssetTransform;
}

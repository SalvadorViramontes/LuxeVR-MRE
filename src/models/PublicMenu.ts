import { Model } from "./_Model";
import { AssetTransform } from "../types/descriptors/AssetTransform";

export interface PublicMenu extends Model {
    displayName: string;
    resourceName: string;
    menu: AssetTransform;
    mainButton: AssetTransform;
    desktopMemberButton: AssetTransform;
}

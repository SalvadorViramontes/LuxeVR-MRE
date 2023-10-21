import { AssetTransform } from "./AssetTransform";
import { AssetDescriptor } from "./AssetDescriptor";

export type PublicMenuDescriptor = AssetDescriptor & {
    menu: AssetTransform;
    mainButton: AssetTransform;
    desktopMemberButton: AssetTransform;
}

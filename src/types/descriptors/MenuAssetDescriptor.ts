import { AssetTransform } from "./AssetTransform";
import { AssetDescriptor } from "./AssetDescriptor";

export type MenuAssetDescriptor = AssetDescriptor & {
    menu: AssetTransform;
    button: AssetTransform;
}

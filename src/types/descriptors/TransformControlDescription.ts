import { AssetTransform } from "./AssetTransform";
import { AssetDescriptor } from "./AssetDescriptor";

export type TransformControlDescriptor = AssetDescriptor & {
    publicMenu: AssetTransform;
    memberMenu: AssetTransform;
    buttons: AssetTransform[];
}

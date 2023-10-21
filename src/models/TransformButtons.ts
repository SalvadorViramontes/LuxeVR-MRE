import { Model } from "./_Model";
import { AssetTransform } from "../types/descriptors/AssetTransform";

export interface TransformButtons extends Model {
    displayName: string;
    resourceName: string;
    publicMenu: AssetTransform;
    memberMenu: AssetTransform;
    buttons: AssetTransform[];
}

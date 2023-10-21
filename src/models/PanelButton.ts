import { Model } from "./_Model";
import { AssetTransform } from "../types/descriptors/AssetTransform";

export interface PanelButton extends Model {
    name: string;
    button: AssetTransform;
}

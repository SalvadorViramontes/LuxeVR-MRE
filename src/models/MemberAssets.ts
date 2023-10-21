import { Model } from "./_Model";
import { AltspaceUser } from "./AltspaceUser";
import { WearableAsset } from "./WearableAsset";

export interface MemberAssets extends Model {
    altspaceUser: AltspaceUser;
    wearableAssets: WearableAsset[];
}

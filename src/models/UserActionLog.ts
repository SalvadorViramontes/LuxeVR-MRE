import { Model } from "./_Model";
import { AltspaceUser } from "./AltspaceUser";

export interface UserActionLog extends Model {
    altspaceUser: AltspaceUser;
    description: string;
}

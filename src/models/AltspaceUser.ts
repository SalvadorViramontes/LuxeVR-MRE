import { Model } from "./_Model";

export interface AltspaceUser extends Model {
    name: string;
    isMember: boolean;
    altspaceId: string;
    email?: string;
}

import { StrapiModel } from "./_StrapiModel";
import { AltspaceUserDTO } from "./AltspaceUser.dto";

export interface UserActionLogDTO {
    altspace_user: StrapiModel<Partial<AltspaceUserDTO>>;
    description: string;
}

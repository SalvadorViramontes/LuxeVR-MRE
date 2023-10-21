import { MySqlModelDTO } from "./_MySqlModel.dto"

export interface AltspaceUserDTO extends MySqlModelDTO {
    name: string;
    is_member: boolean;
    guid: string;
    created_at: string;
    updated_at: string;
}

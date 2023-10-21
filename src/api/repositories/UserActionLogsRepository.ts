/* tslint:disable camelcase */
import qs from "qs";
import { AxiosInstance } from "axios";
import StrapiRepository from "./_StrapiRepository";
import { StrapiModel } from "../models/_StrapiModel";
import { AltspaceUser } from "../../models/AltspaceUser";
import { StrapiResponse } from "../models/_StrapiResponse";
import { UserActionLog } from "../../models/UserActionLog";
import { AltspaceUserDTO } from "../models/AltspaceUser.dto";
import { UserActionLogDTO } from "../models/UserActionLog.dto";

export default class UserActionLogsRepository extends StrapiRepository<UserActionLog, UserActionLogDTO>{
    constructor(
        instance: AxiosInstance,
    ) {
        const query = qs.stringify(
            {
                populate: 'altspace_user'
            },
            { encodeValuesOnly: true }
        );
        super(
            instance,
            'user-action-logs',
            (model: Partial<UserActionLog>): Partial<UserActionLogDTO> => {
                const dto = {
                    altspace_user: {
                        id: model.altspaceUser.id,
                    },
                    description: model.description
                };
                return dto;
            },
            (dtoWrap: StrapiModel<UserActionLogDTO>): UserActionLog => {
                const unwrappedAltspaceUser = dtoWrap.attributes.altspace_user as unknown as StrapiResponse<StrapiModel<AltspaceUserDTO>>;
                let altspaceUser: AltspaceUser;
                if(unwrappedAltspaceUser){
                    altspaceUser = {
                        id: unwrappedAltspaceUser.data.id,
                        isMember: unwrappedAltspaceUser.data.attributes.is_member,
                        email: unwrappedAltspaceUser.data.attributes.email,
                        altspaceId: unwrappedAltspaceUser.data.attributes.altspace_id,
                        name: unwrappedAltspaceUser.data.attributes.name
                    }
                }
                return {
                    id: dtoWrap.id,
                    altspaceUser,
                    description: dtoWrap.attributes.description
                };
            },
            query
        )
    }
}

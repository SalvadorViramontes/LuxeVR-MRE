/* tslint:disable camelcase */
import { AxiosInstance } from "axios";
import StrapiRepository from "./_StrapiRepository";
import { StrapiModel } from "../models/_StrapiModel";
import { AltspaceUser } from "../../models/AltspaceUser";
import { AltspaceUserDTO } from "../models/AltspaceUser.dto";

export default class AltspaceUserRepository extends StrapiRepository<AltspaceUser, AltspaceUserDTO>{
    constructor(
        instance: AxiosInstance,
    ) {
        super(
            instance,
            'altspace-users',
            (model: Partial<AltspaceUser>): Partial<AltspaceUserDTO> => {
                const dto = {
                    is_member: model.isMember,
                    email: model.email,
                    name: model.name,
                    altspace_id: model.altspaceId
                };
                return dto;
            },
            (dtoWrap: StrapiModel<AltspaceUserDTO>): AltspaceUser => {
                return {
                    id: dtoWrap.id,
                    isMember: dtoWrap.attributes.is_member,
                    email: dtoWrap.attributes.email,
                    altspaceId: dtoWrap.attributes.altspace_id,
                    name: dtoWrap.attributes.name
                };
            }
        )
    }
}

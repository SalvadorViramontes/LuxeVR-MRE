import qs from "qs";
import { AxiosInstance } from "axios";
import StrapiRepository from "./_StrapiRepository";
import { PublicMenu } from "../../models/PublicMenu";
import { StrapiModel } from "../models/_StrapiModel";
import { PublicMenuDTO } from "../models/PublicMenu.dto";

export default class PublicMenuRepository extends StrapiRepository<PublicMenu, PublicMenuDTO>{
    constructor(
        instance: AxiosInstance,
    ) {
        const query = qs.stringify(
            {
                populate: [
                    'menu,mainButton,desktopMemberButton',
                    'menu.scale,menu.rotation,menu.position,mainButton.scale,mainButton.rotation,mainButton.position,desktopMemberButton.scale,desktopMemberButton.rotation,desktopMemberButton.position'
                ],
            },
            { encodeValuesOnly: true }
        );
        super(
            instance,
            'public-menu',
            (model: Partial<PublicMenu>): Partial<PublicMenuDTO> => {
                const dto = {
                    displayName: model.displayName,
                    resourceName: model.resourceName,
                    menu: model.menu,
                    mainButton: model.mainButton,
                    desktopMemberButton: model.desktopMemberButton
                };
                return dto;
            },
            (dtoWrap: StrapiModel<PublicMenuDTO>): PublicMenu => {
                return {
                    id: dtoWrap.id,
                    displayName: dtoWrap.attributes.displayName,
                    resourceName: dtoWrap.attributes.resourceName,
                    menu: dtoWrap.attributes.menu,
                    mainButton: dtoWrap.attributes.mainButton,
                    desktopMemberButton: dtoWrap.attributes.desktopMemberButton
                };
            },
            query
        )
    }
}

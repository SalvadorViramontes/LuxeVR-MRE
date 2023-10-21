import qs from "qs";
import { AxiosInstance } from "axios";
import StrapiRepository from "./_StrapiRepository";
import { StrapiModel } from "../models/_StrapiModel";
import { TransformButtons } from "../../models/TransformButtons";
import { TransformButtonsDTO } from "../models/TransformButtons.dto";

export default class TransformButtonsRepository extends StrapiRepository<TransformButtons, TransformButtonsDTO>{
    constructor(
        instance: AxiosInstance,
    ) {
        const query = qs.stringify(
            {
                populate: [
                    'publicMenu,memberMenu,buttons',
                    'publicMenu.scale,publicMenu.rotation,publicMenu.position,memberMenu.scale,memberMenu.rotation,memberMenu.position,buttons.scale,buttons.rotation,buttons.position'
                ],
            },
            { encodeValuesOnly: true }
        );
        super(
            instance,
            'transform-button',
            (model: Partial<TransformButtons>): Partial<TransformButtonsDTO> => {
                const dto = {
                    displayName: model.displayName,
                    resourceName: model.resourceName,
                    publicMenu: model.publicMenu,
                    memberMenu: model.memberMenu,
                    buttons: model.buttons
                };
                return dto;
            },
            (dtoWrap: StrapiModel<TransformButtonsDTO>): TransformButtons => {
                return {
                    id: dtoWrap.id,
                    displayName: dtoWrap.attributes.displayName,
                    resourceName: dtoWrap.attributes.resourceName,
                    publicMenu: dtoWrap.attributes.publicMenu,
                    memberMenu: dtoWrap.attributes.memberMenu,
                    buttons: dtoWrap.attributes.buttons
                };
            },
            query
        )
    }
}

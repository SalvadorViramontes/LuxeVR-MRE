import qs from "qs";
import { AxiosInstance } from "axios";
import StrapiRepository from "./_StrapiRepository";
import { StrapiModel } from "../models/_StrapiModel";
import { PanelButton } from "../../models/PanelButton";
import { PanelButtonDTO } from "../models/PanelButton.dto";

export default class PanelButtonsRepository extends StrapiRepository<PanelButton, PanelButtonDTO>{
    constructor(
        instance: AxiosInstance,
    ) {
        const query = qs.stringify(
            {
                populate: [
                    'button',
                    'button.scale,button.rotation,button.position'
                ],
            },
            { encodeValuesOnly: true }
        );
        super(
            instance,
            'panel-buttons',
            (model: Partial<PanelButton>): Partial<PanelButtonDTO> => {
                const dto = {
                    name: model.name,
                    button: model.button
                };
                return dto;
            },
            (dtoWrap: StrapiModel<PanelButtonDTO>): PanelButton => {
                return {
                    id: dtoWrap.id,
                    name: dtoWrap.attributes.name,
                    button: dtoWrap.attributes.button
                };
            },
            query
        )
    }
}

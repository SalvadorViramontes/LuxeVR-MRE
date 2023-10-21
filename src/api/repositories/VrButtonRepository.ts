import qs from "qs";
import { AxiosInstance } from "axios";
import { VrButton } from "../../models/VrButton";
import StrapiRepository from "./_StrapiRepository"; 
import { StrapiModel } from "../models/_StrapiModel";
import { VrButtonDTO } from "../models/VrButton.dto";
import { AttachmentPoint } from "../../enums/AttachmentPoint";

export default class VrButtonRepository extends StrapiRepository<VrButton, VrButtonDTO>{
    constructor(
        instance: AxiosInstance,
    ) {
        const query = qs.stringify(
            {
                populate: ['button', 'button.scale,button.rotation,button.position'],
            },
            { encodeValuesOnly: true }
        );
        super(
            instance,
            'vr-button',
            (model: Partial<VrButton>): Partial<VrButtonDTO> => {
                const dto = {
                    displayName: model.displayName,
                    resourceName: model.resourceName,
                    attachmentPoint: model.attachmentPoint as string,
                    button: model.button,
                };
                return dto;
            },
            (dtoWrap: StrapiModel<VrButtonDTO>): VrButton => {
                return {
                    id: dtoWrap.id,
                    displayName: dtoWrap.attributes.displayName,
                    resourceName: dtoWrap.attributes.resourceName,
                    attachmentPoint: dtoWrap.attributes.attachmentPoint as AttachmentPoint,
                    button: dtoWrap.attributes.button,
                };
            },
            query
        )
    }
}

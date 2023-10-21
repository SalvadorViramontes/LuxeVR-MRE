import qs from "qs";
import { AxiosInstance } from "axios";
import StrapiRepository from "./_StrapiRepository";
import { StrapiModel } from "../models/_StrapiModel";
import { MemberPanel } from "../../models/MemberPanel";
import { MemberPanelDTO } from "../models/MemberPanel.dto";
import { AttachmentPoint } from "../../enums/AttachmentPoint";

export default class MemberPanelRepository extends StrapiRepository<MemberPanel, MemberPanelDTO>{
    constructor(
        instance: AxiosInstance,
    ) {
        const query = qs.stringify(
            {
                populate: [
                    'wearable',
                    'wearable.scale,wearable.rotation,wearable.position'
                ],
            },
            { encodeValuesOnly: true }
        );
        super(
            instance,
            'member-panel',
            (model: Partial<MemberPanel>): Partial<MemberPanelDTO> => {
                const dto = {
                    displayName: model.displayName,
                    resourceName: model.resourceName,
                    attachmentPoint: model.attachmentPoint as string,
                    wearable: model.wearable
                };
                return dto;
            },
            (dtoWrap: StrapiModel<MemberPanelDTO>): MemberPanel => {
                return {
                    id: dtoWrap.id,
                    displayName: dtoWrap.attributes.displayName,
                    resourceName: dtoWrap.attributes.resourceName,
                    attachmentPoint: dtoWrap.attributes.attachmentPoint as AttachmentPoint,
                    wearable: dtoWrap.attributes.wearable
                };
            },
            query
        )
    }
}

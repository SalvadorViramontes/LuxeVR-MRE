import qs from "qs";
import { AxiosInstance } from "axios";
import StrapiRepository from "./_StrapiRepository";
import { StrapiModel } from "../models/_StrapiModel";
import { WearableAsset } from "../../models/WearableAsset";
import { AttachmentPoint } from "../../enums/AttachmentPoint";
import { WearableAssetDTO } from "../models/WearableAsset.dto";

export default class WearableAssetsRepository extends StrapiRepository<WearableAsset, WearableAssetDTO>{
    constructor(
        instance: AxiosInstance,
    ) {
        const query = qs.stringify(
            {
                populate: [
                    'menu,button,wearable',
                    'menu.scale,menu.rotation,menu.position,button.scale,button.rotation,button.position,wearable.scale,wearable.rotation,wearable.position'
                ],
            },
            { encodeValuesOnly: true }
        );
        super(
            instance,
            'wearable-assets',
            (model: Partial<WearableAsset>): Partial<WearableAssetDTO> => {
                const dto = {
                    displayName: model.displayName,
                    resourceName: model.resourceName,
                    controlHeight: model.controlHeight,
                    attachmentPoint: model.attachmentPoint as string,
                    assetKey: model.assetKey,
                    type: model.type,
                    menu: model.menu,
                    button: model.button,
                    wearable: model.wearable,
                };
                return dto;
            },
            (dtoWrap: StrapiModel<WearableAssetDTO>): WearableAsset => {
                return {
                    id: dtoWrap.id,
                    displayName: dtoWrap.attributes.displayName,
                    resourceName: dtoWrap.attributes.resourceName,
                    controlHeight: dtoWrap.attributes.controlHeight,
                    attachmentPoint: dtoWrap.attributes.attachmentPoint as AttachmentPoint,
                    assetKey: dtoWrap.attributes.assetKey,
                    type: dtoWrap.attributes.type,
                    menu: dtoWrap.attributes.menu,
                    button: dtoWrap.attributes.button,
                    wearable: dtoWrap.attributes.wearable,
                };
            },
            query
        )
    }
}

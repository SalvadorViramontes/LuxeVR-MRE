/* tslint:disable camelcase */
import qs from "qs";
import { AxiosInstance } from "axios";
import StrapiRepository from "./_StrapiRepository";
import { StrapiModel } from "../models/_StrapiModel";
import { AltspaceUser } from "../../models/AltspaceUser";
import { StrapiResponse } from "../models/_StrapiResponse";
import { WearableAsset } from "../../models/WearableAsset";
import { AltspaceUserDTO } from "../models/AltspaceUser.dto";
import { AttachmentPoint } from "../../enums/AttachmentPoint";
import { WearableAssetDTO } from "../models/WearableAsset.dto";
import { UserCustomAssetTransforms } from "../../models/UserCustomAssetTransforms";
import { UserCustomAssetTransformsDTO } from "../models/UserCustomAssetTransforms.dto";

export default class UserCustomAssetTransformsRepository extends StrapiRepository<UserCustomAssetTransforms, UserCustomAssetTransformsDTO>{
    constructor(
        instance: AxiosInstance,
    ) {
        const query = qs.stringify(
            {
                populate: [
                    'altspace_user,wearable_asset,customAssetTransform',
                    'customAssetTransform.scale,customAssetTransform.rotation,customAssetTransform.position'
                ],
            },
            { encodeValuesOnly: true }
        );
        super(
            instance,
            'user-custom-asset-transforms',
            (model: Partial<UserCustomAssetTransforms>): Partial<UserCustomAssetTransformsDTO> => {
                const dto: Partial<UserCustomAssetTransformsDTO> = {
                    customAssetTransform: model.customAssetTransform
                };
                
                if(model.altspaceUser){
                    dto.altspace_user = {
                        id: model.altspaceUser.id,
                    };
                }
                if(model.wearableAsset){
                    dto.wearable_asset = {
                        id: model.wearableAsset.id,
                    };
                }
                
                return dto;
            },
            (dtoWrap: StrapiModel<UserCustomAssetTransformsDTO>): UserCustomAssetTransforms => {
                const unwrappedAltspaceUser = dtoWrap.attributes.altspace_user as unknown as StrapiResponse<StrapiModel<AltspaceUserDTO>>;
                const unwrappedWearableAsset = dtoWrap.attributes.wearable_asset as unknown as StrapiResponse<StrapiModel<WearableAssetDTO>>;

                let altspaceUser: AltspaceUser;
                if(unwrappedAltspaceUser){
                    altspaceUser = {
                        id: unwrappedAltspaceUser.data.id,
                        isMember: unwrappedAltspaceUser.data.attributes.is_member,
                        email: unwrappedAltspaceUser.data.attributes.email,
                        altspaceId: unwrappedAltspaceUser.data.attributes.altspace_id,
                        name: unwrappedAltspaceUser.data.attributes.name
                    };
                }
                
                let wearableAsset: WearableAsset;
                if(unwrappedWearableAsset){
                    wearableAsset = {
                        id: unwrappedWearableAsset.data.id,
                        displayName: unwrappedWearableAsset.data.attributes.displayName,
                        resourceName: unwrappedWearableAsset.data.attributes.resourceName,
                        controlHeight: unwrappedWearableAsset.data.attributes.controlHeight,
                        attachmentPoint: unwrappedWearableAsset.data.attributes.attachmentPoint as AttachmentPoint,
                        assetKey: unwrappedWearableAsset.data.attributes.assetKey,
                        type: unwrappedWearableAsset.data.attributes.type,
                        menu: unwrappedWearableAsset.data.attributes.menu,
                        button: unwrappedWearableAsset.data.attributes.button,
                        wearable: unwrappedWearableAsset.data.attributes.wearable,
                    };
                }
                
                return {
                    id: dtoWrap.id,
                    altspaceUser,
                    wearableAsset,
                    customAssetTransform: dtoWrap.attributes.customAssetTransform
                };
            },
            query
        )
    }
}

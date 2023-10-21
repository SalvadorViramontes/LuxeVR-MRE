/* tslint:disable camelcase */
import qs from 'qs';
import { AxiosInstance } from "axios";
import StrapiRepository from "./_StrapiRepository";
import { StrapiModel } from '../models/_StrapiModel';
import { AltspaceUser } from '../../models/AltspaceUser';
import { MemberAssets } from '../../models/MemberAssets';
import { StrapiResponse } from '../models/_StrapiResponse';
import { WearableAsset } from '../../models/WearableAsset';
import { AltspaceUserDTO } from '../models/AltspaceUser.dto';
import { MemberAssetsDTO } from '../models/MemberAssets.dto';
import { AttachmentPoint } from '../../enums/AttachmentPoint';
import { WearableAssetDTO } from '../models/WearableAsset.dto';

export default class MemberAssetsRepository extends StrapiRepository<MemberAssets, MemberAssetsDTO>{
    constructor(
        instance: AxiosInstance,
    ) {
        const query = qs.stringify(
            {
                populate: [
                    'altspace_user,wearable_assets',
                    'wearable_assets.menu,wearable_assets.button,wearable_assets.wearable',
                    'wearable_assets.menu.scale,wearable_assets.menu.rotation,wearable_assets.menu.position,wearable_assets.button.scale,wearable_assets.button.rotation,wearable_assets.button.position,wearable_assets.wearable.scale,wearable_assets.wearable.rotation,wearable_assets.wearable.position'
                ],
            },
            { encodeValuesOnly: true }
        );
        super(
            instance,
            'member-assets',
            (model: Partial<MemberAssets>): Partial<MemberAssetsDTO> => {
                const dto = {
                    altspace_user: {
                        id: model.altspaceUser.id,
                    },
                    wearable_assets: model.wearableAssets.map(wearableAsset => {
                        return {
                            id: wearableAsset.id
                        }
                    })
                };
                return dto;
            },
            (dtoWrap: StrapiModel<MemberAssetsDTO>): MemberAssets => {
                const unwrappedAltspaceUser = dtoWrap.attributes.altspace_user as unknown as StrapiResponse<StrapiModel<AltspaceUserDTO>>;
                const unwrappedWearableAssets = dtoWrap.attributes.wearable_assets as unknown as StrapiResponse<Array<StrapiModel<WearableAssetDTO>>>;
                
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

                let wearableAssets: WearableAsset[];
                if(unwrappedWearableAssets){
                    wearableAssets = unwrappedWearableAssets.data.map(wearableAssetDTO => {
                        return {
                            id: wearableAssetDTO.id,
                            displayName: wearableAssetDTO.attributes.displayName,
                            resourceName: wearableAssetDTO.attributes.resourceName,
                            controlHeight: wearableAssetDTO.attributes.controlHeight,
                            attachmentPoint: wearableAssetDTO.attributes.attachmentPoint as AttachmentPoint,
                            assetKey: wearableAssetDTO.attributes.assetKey,
                            type: wearableAssetDTO.attributes.type,
                            menu: wearableAssetDTO.attributes.menu,
                            button: wearableAssetDTO.attributes.button,
                            wearable: wearableAssetDTO.attributes.wearable,
                        };
                    });
                }
                
                return {
                    id: dtoWrap.id,
                    altspaceUser,
                    wearableAssets
                };
            },
            query
        )
    }
}

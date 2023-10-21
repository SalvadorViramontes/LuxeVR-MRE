import { MemberAssets } from '../models/MemberAssets';
import { CatchAll } from '../decorators/CatchDecorator';
import { WearableAsset } from '../models/WearableAsset';
import { User } from '@microsoft/mixed-reality-extension-sdk';
import RepositoryManager from '../managers/RepositoryManager';

@CatchAll((err) => console.trace(err))
export default class MemberAssetMapService {
    constructor(private repositoryManager: RepositoryManager){
    }    
    async GetMemberAssets(user: User, page?: number): Promise<WearableAsset[]> {
        const mapItems: MemberAssets = await this.repositoryManager.memberAssetsRepository.readByField('altspace_user][altspace_id', user.id.toString())
        if(page) { return mapItems.wearableAssets.slice(6*(1-page), (6*page)-1); }
        return mapItems.wearableAssets;
    }
}

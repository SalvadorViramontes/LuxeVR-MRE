import { CatchAll } from '../decorators/CatchDecorator';
import { memberAssetMapValues } from '../constants/services/memberAssetMapValues';

export default class MemberAssetMapService {
    private static MemberAssetMapRecord: Record<string, string[]> = memberAssetMapValues;

    @CatchAll((err) => console.trace(err))
    static GetMemberAssets(userName: string, page?: number): string[] {
        const mapItems = MemberAssetMapService.MemberAssetMapRecord[userName] ?? [];

        if(!page) { return mapItems; }
        if(page < 1) { throw new Error("Page must be a positive integer"); }
        
        const start = 6 * (page - 1);
        const end = start + 6;
        return mapItems.slice(start, end);
    }
}

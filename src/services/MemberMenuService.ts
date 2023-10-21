import AsyncMap from "../models/AsyncMap";
import { MemberMenu } from "../types/MemberMenu";
import { Guid } from "@microsoft/mixed-reality-extension-sdk";

export default class MemberMenuService {
    private userMemberMenuMap: AsyncMap<Guid, MemberMenu> = new AsyncMap<Guid, MemberMenu>();
    
    constructor() {
        this.userMemberMenuMap = new AsyncMap<Guid, MemberMenu>();
    }

    public getUserMemberMenu(userId: Guid): Promise<MemberMenu> {
        return this.userMemberMenuMap.get(userId);
    }

    public setUserMemberMenu(userId: Guid, menu: MemberMenu): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try{
                this.userMemberMenuMap.set(userId, menu);
                resolve();
            } catch(err){
                reject(err);
            }
        })
    }
}

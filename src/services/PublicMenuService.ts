import AsyncMap from "../models/AsyncMap";
import { PublicMenuItem } from "../types/PublicMenuItem";

export default class PublicMenuService {
    private publicMenuItems: AsyncMap<string, PublicMenuItem> = new AsyncMap<string, PublicMenuItem>();
    
    constructor() {
        this.publicMenuItems = new AsyncMap<string, PublicMenuItem>();
    }

    public getPublicMenuItem(assetKey: string): Promise<PublicMenuItem> {
        return this.publicMenuItems.get(assetKey);
    }

    public setPublicMenuItem(assetKey: string, item: PublicMenuItem): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try{
                this.publicMenuItems.set(assetKey, item);
                resolve();
            } catch(err){
                reject(err);
            }
        })
    }
}

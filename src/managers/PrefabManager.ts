import LogHelper from "../helpers/LogHelper";
import { CatchAll } from "../decorators/CatchDecorator";
import ResourceManager from "../contracts/ResourceManager";
import { Prefab } from "@microsoft/mixed-reality-extension-sdk";

@CatchAll((err) => console.trace(err))
export default class PrefabManager extends ResourceManager<Prefab> {
    constructor(logHelper: LogHelper){
        super(logHelper);
        this.name = "prefab-manager";
    }

    public CompareResourceToWearable(resource: Prefab, wearable: Prefab): boolean {
        return resource.id === wearable.id;
    }
}

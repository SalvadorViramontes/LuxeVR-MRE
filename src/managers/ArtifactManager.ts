import LogHelper from "../helpers/LogHelper";
import { CatchAll } from "../decorators/CatchDecorator";
import ResourceManager from "../contracts/ResourceManager";

@CatchAll((err) => console.trace(err))
export default class ArtifactManager extends ResourceManager<string> {
    constructor(logHelper: LogHelper){
        super(logHelper);
        this.name = "artifact-manager";
    }

    public CompareResourceToWearable(resource: string, wearable: string): boolean {
        return resource === wearable;
    }
}

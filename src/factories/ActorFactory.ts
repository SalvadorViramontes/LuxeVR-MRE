import PrefabManager from "../managers/PrefabManager";
import { CatchAll } from "../decorators/CatchDecorator";
import { AssetDescriptor } from "../types/descriptors/AssetDescriptor";
import { REGEXP_VALUES } from "../constants/configuration/regExpValues";
import { Actor, ActorLike, Context } from "@microsoft/mixed-reality-extension-sdk";

@CatchAll((err) => console.trace(err))
export default class ActorFactory {
    constructor(
        private context: Context,
        private prefabManager: PrefabManager
    ) { }

    @CatchAll((err) => console.trace(err))
    static CheckIfArtifactAsset(resourceName: string){
        return !!REGEXP_VALUES.Artifact.exec(resourceName);
    }

    public CreateActor(
        actorDescription: Partial<ActorLike>,
        assetKey?: string,
        assetDescriptor?: AssetDescriptor
    ): Actor {
        if(!assetDescriptor){
            return Actor.Create(this.context, {
                actor: actorDescription
            });
        }

        if(!assetDescriptor.resourceName) {
            throw new Error(`Resource name for ${assetDescriptor.displayName} not found`);
        }
        
        if(REGEXP_VALUES.Artifact.exec(assetDescriptor.resourceName)){
            return Actor.CreateFromLibrary(this.context, {
                resourceId: assetDescriptor.resourceName,
                actor: actorDescription
            });
        } else {
            if(!assetKey) {
                throw new Error(`Asset key for ${assetDescriptor.displayName} not provided`);
            }
            
            return Actor.CreateFromPrefab(this.context, {
                prefab: this.prefabManager.GetResource(assetKey),
                actor: actorDescription
            });
        }
    }

    public CreateButton(actorDescription: Partial<ActorLike>): Actor {
        return Actor.Create(this.context, {
            actor: actorDescription,
        });
    }

    public CreateText(actorDescription: Partial<ActorLike>): Actor {
        return Actor.Create(this.context, {
            actor: actorDescription
        });
    }
}

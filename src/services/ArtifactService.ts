import { CatchAll } from '../decorators/CatchDecorator';
import { AssetDescriptor } from '../types/descriptors/AssetDescriptor';
import { publicAssetDeclaration } from '../constants/assetDeclarations/publicAssetDeclaration';
import { memberAssetDeclaration } from '../constants/assetDeclarations/memberAssetDeclaration';

export default class ArtifactService {
    @CatchAll((err) => console.trace(err))
    static GetPublicAssetDeclaration(): Record<string, AssetDescriptor>{
        return publicAssetDeclaration as Record<string, AssetDescriptor>;
    }

    @CatchAll((err) => console.trace(err))
    static GetMemberAssetDeclaration(): Record<string,AssetDescriptor> {
        return memberAssetDeclaration as Record<string, AssetDescriptor>;
    }
}

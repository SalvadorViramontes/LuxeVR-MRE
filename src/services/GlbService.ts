import { CatchAll } from '../decorators/CatchDecorator';
import { Descriptor } from '../types/descriptors/Descriptor';
import { UtilityAssetDeclaration } from '../constants/assetDeclarations/utilityAssetDeclaration';

export default class GlbService {
    @CatchAll((err) => console.trace(err))
    static GetUtilityAssetDeclaration(): Record<string, Descriptor>{
        return UtilityAssetDeclaration as Record<string, Descriptor>;
    }
}

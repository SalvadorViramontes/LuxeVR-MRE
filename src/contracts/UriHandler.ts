import { CatchAll } from "../decorators/CatchDecorator";

export default abstract class UriHandler {
    @CatchAll((err) => console.trace(err))
    static GetAssetUri = (assetName: string): string => `./${assetName}`;
}

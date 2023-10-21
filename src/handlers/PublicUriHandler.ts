import UriHandler from "../contracts/UriHandler";
import { CatchAll } from "../decorators/CatchDecorator";

export class PublicUriHandler extends UriHandler {
    @CatchAll((err) => console.trace(err))
    static GetAssetUri = (assetName: string): string => `./non-members/${assetName}`;
}

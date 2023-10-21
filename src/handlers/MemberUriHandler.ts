import UriHandler from "../contracts/UriHandler";
import { CatchAll } from "../decorators/CatchDecorator";

export class MemberUriHandler extends UriHandler {
    @CatchAll((err) => console.trace(err))
    static GetAssetUri = (assetName: string): string => `./members/${assetName}`;
}

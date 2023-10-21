import UriHandler from "../contracts/UriHandler";
import EnumUtilities from "../utils/EnumUtilities";
import { CatchAll } from "../decorators/CatchDecorator";
import { MembershipMask } from "../enums/MembershipMask";
import { MemberUriHandler } from "../handlers/MemberUriHandler";
import { PublicUriHandler } from "../handlers/PublicUriHandler";

export default class UriHandlerFactory {
    static UriHandlerRecord: Record<string, typeof UriHandler> = {
        PublicUriHandler,
        MemberUriHandler
    }

    @CatchAll((err) => console.trace(err))
    static GetUriHandler(membership: MembershipMask): typeof UriHandler {
        const memberName = EnumUtilities.getEnumName(MembershipMask, membership);
        const handler = UriHandlerFactory.UriHandlerRecord[`${memberName}UriHandler`];
        return handler;
    }
}

import EnumUtilities from '../utils/EnumUtilities';
import { CatchAll } from '../decorators/CatchDecorator';
import { MembershipMask } from '../enums/MembershipMask';
import { Context, GroupMask } from '@microsoft/mixed-reality-extension-sdk';

@CatchAll((err) => console.trace(err))
export class GroupMaskManager {
    private masks: Record<string, GroupMask>;

    public constructor(private context: Context) {
        this.masks = {};
        GroupMaskManager.GetGroupMasks(MembershipMask).forEach(maskName => {
            const mask = new GroupMask(this.context, [maskName]);
            this.masks[maskName] = mask;
        });
    }

    @CatchAll((err) => console.trace(err))
    private static GetGroupMasks<E extends number, K extends string>(anEnum: { [key in K]: E }): string[] {
        return Object.values(anEnum).filter(v => typeof v === 'string') as string[];
    }

    public getMask(membership: MembershipMask): GroupMask {
        const maskName = EnumUtilities.getEnumName(MembershipMask, membership);
        return this.masks[maskName];
    }
}

import { CatchAll } from '../decorators/CatchDecorator';
import { memberListDeclaration } from '../constants/services/memberListDeclaration';

export default class MemberService {
    @CatchAll((err) => console.trace(err))
    static GetMembers(): string[] {
        return memberListDeclaration.members;
    }
}

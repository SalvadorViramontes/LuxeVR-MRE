import LogHelper from "../helpers/LogHelper";
import { Message } from '../contracts/Message';
import MessageBroker from "../models/MessageBroker";
import RepositoryManager from "./RepositoryManager";
import { AltspaceUser } from "../models/AltspaceUser";
import MessageTrader from '../contracts/MessageTrader';
import { CatchAll } from "../decorators/CatchDecorator";
import { Guid, User } from "@microsoft/mixed-reality-extension-sdk";

@CatchAll((err) => console.trace(err))
export default class UserMembershipManager extends MessageTrader {  
    constructor(
        protected logHelper: LogHelper,
        protected messageBroker: MessageBroker,
        protected repositoryManager: RepositoryManager
    ) {
        super('user-membership', messageBroker);
    }
    
    // #region Subscription
    Update(_message: Message<any>): void {
        return;
    }
    // #endregion

    public async IsMember(userId: Guid): Promise<boolean> {
        try{
            const member = await this.repositoryManager.altspaceUserRepository.readByFields({
                altspace_id: userId.toString(),
                is_member: true
            });
            return !!member;
        } catch(e){
            return false
        }
    }

    public async AddUser(user: User): Promise<void> {
        this.logHelper.info('user-membership-manager', `Adding new user "${user.name}" with id ${user.id.toString()}`);

        this.SendMessage({
            type: 'new-user',
            payload: user
        }, 'attachment-manager');

        const existingUserDTO = await this.repositoryManager.altspaceUserRepository.readByField('name', user.name);
        if(!existingUserDTO) {
            const altspaceUser: AltspaceUser = {
                name: user.name,
                isMember: false,
                altspaceId: user.id.toString()
            };
            this.repositoryManager.altspaceUserRepository.create(altspaceUser);
        } else{
            if(existingUserDTO.altspaceId !== user.id.toString()){
                this.repositoryManager.altspaceUserRepository.update({
                    ...existingUserDTO,
                    altspaceId: user.id.toString()
                });
            }
        }

        const userIsMember = this.IsMember(user.id);
        if(userIsMember) { this.AddMember(user); }
    }

    public async RemoveUser(user: User): Promise<void> {
        if(await this.IsMember(user.id)) { this.RemoveMember(user); }

        user.groups.clear();
        
        this.logHelper.info('user-membership-manager', `Removing user: ${user.name}`);
    }

    public AddMember(user: User): void { 
        user.groups.add('Member');
        this.logHelper.info('user-membership-manager', `Adding user ${user.name} as new member`);

        this.SendMessage({
            type: 'new-member',
            payload: user
        }, 'member-menu');
    }
    
    public RemoveMember(user: User): void {
        user.groups.delete('Member');
        this.logHelper.info('user-membership-manager', `Removing user ${user.name} as member`);

        this.SendMessage({
            type: 'bye-member',
            payload: user
        }, 'member-menu');
    }
}

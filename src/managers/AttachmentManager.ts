import AsyncMap from '../models/AsyncMap';
import LogHelper from '../helpers/LogHelper';
import { Nullable } from '../types/Generics';
import { Message } from '../contracts/Message';
import MessageBroker from '../models/MessageBroker';
import { LogVerbosity } from '../enums/LogVerbosity';
import MessageTrader from '../contracts/MessageTrader';
import { CatchAll } from '../decorators/CatchDecorator';
import AttachmentStruct from '../models/AttachmentStruct';
import { AttachmentPoint } from '../enums/AttachmentPoint';
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Actor, Guid } from '@microsoft/mixed-reality-extension-sdk';

@CatchAll((err) => console.trace(err))
export default class AttachmentManager extends MessageTrader {
    private userAttachmentMapper = new AsyncMap<MRE.Guid, AttachmentStruct>();

    constructor(protected messageBroker: MessageBroker, protected logHelper: LogHelper) {
        super('attachment-manager', messageBroker);
    }

    public Update<User>(message: Message<User>): void{
        if(!message.payload) { return; }

        const user = message.payload as unknown as MRE.User;
        
        if (message.type === 'new-user') { this.NewUserAttachment(user.id); } else { return; }
    }

    public async GetAllActorIds(userId: Guid): Promise<Guid[]> {
        let attachmentStruct = await this.userAttachmentMapper.get(userId);
        if(!attachmentStruct) {
            await this.NewUserAttachment(userId);
            attachmentStruct = await this.userAttachmentMapper.get(userId);
        }
        this.logHelper.info('attachment-manager', `Getting all actor id attachments for user ${userId}`,
            LogVerbosity.Four);
        return attachmentStruct.allActorIds;
    }

    public async NewUserAttachment(userId: Guid): Promise<void> {
        if (await this.userAttachmentMapper.has(userId)) { return; }

        this.logHelper.info('attachment-manager', `New user attachment for user ${userId}`,
            LogVerbosity.Four);
        const attachmentStruct = new AttachmentStruct();
        await this.userAttachmentMapper.set(userId, attachmentStruct);
    }

    public async SetUserAttachment(userId: Guid, attachmentPoint: AttachmentPoint, actor: Actor): Promise<void> {
        if (!await this.userAttachmentMapper.has(userId)) { return; }

        this.logHelper.info('attachment-manager', `Setting actor ${actor.id} on ${attachmentPoint
        } for user ${userId}`, LogVerbosity.Four);
        const attachmentStruct = await this.userAttachmentMapper.get(userId);
        attachmentStruct.AddAttachment(attachmentPoint, actor);
        await this.userAttachmentMapper.set(userId, attachmentStruct);
    }

    public async GetUserAttachment(userId: Guid, attachmentPoint: AttachmentPoint): Promise<Nullable<Actor>> {
        if (!await this.userAttachmentMapper.has(userId)) { return null; }

        this.logHelper.info('attachment-manager', `Getting attachment from ${attachmentPoint
        } for user ${userId}`, LogVerbosity.Four);
        const attachmentStruct = await this.userAttachmentMapper.get(userId)
        return attachmentStruct.GetAttachment(attachmentPoint);
    }

    public async RemoveUserAttachment(userId: Guid, attachmentPoint: AttachmentPoint): Promise<void> {
        if (!await this.userAttachmentMapper.has(userId)) { return; }

        this.logHelper.info('attachment-manager', `Removing attachment from ${attachmentPoint
        } for user ${userId}`, LogVerbosity.Four);
        const attachmentStruct = await this.userAttachmentMapper.get(userId);
        attachmentStruct.RemoveAttachment(attachmentPoint);
        await this.userAttachmentMapper.set(userId, attachmentStruct);
    }

    public async RemoveAllUserAttachments(userId: Guid): Promise<void> {
        if (!await this.userAttachmentMapper.has(userId)) { return; }
        this.logHelper.info('attachment-manager', `Removing all actor attachments for user ${userId}`,
            LogVerbosity.Four);
        const attachmentStruct = await this.userAttachmentMapper.get(userId);
        attachmentStruct.RemoveAllAttachments();
        await this.userAttachmentMapper.delete(userId);
    }
}

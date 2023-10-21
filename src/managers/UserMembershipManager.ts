import AsyncMap from "../models/AsyncMap";
import { Member } from "../models/Member";
import LogHelper from "../helpers/LogHelper";
import { Message } from "../contracts/Message";
import MessageBroker from "../models/MessageBroker";
import RepositoryManager from "./RepositoryManager";
import MemberService from "../services/MemberService";
import MessageTrader from "../contracts/MessageTrader";
import { CatchAll } from "../decorators/CatchDecorator";
import { Guid, User } from "@microsoft/mixed-reality-extension-sdk";
import { AltspaceUserDTO } from "../databases/models/AltspaceUser.dto";

@CatchAll((err) => console.trace(err))
export default class UserMembershipManager extends MessageTrader {
	private guidMemberMap: AsyncMap<Guid, Member> = new AsyncMap<
		Guid,
		Member
	>();
	private membersList: string[];

	constructor(
		protected logHelper: LogHelper,
		protected messageBroker: MessageBroker,
		protected repositoryManager: RepositoryManager
	) {
		super("user-membership", messageBroker);
		this.membersList = MemberService.GetMembers();
	}

	// #region Subscription
	Update(_message: Message<any>): void {
		return;
	}
	// #endregion

	public IsMember = async (userId: Guid): Promise<boolean> =>
		await this.guidMemberMap.has(userId);

	public async AddUser(user: User): Promise<void> {
		this.logHelper.info(
			"user-membership-manager",
			`Adding new user "${user.name}" with id ${user.id.toString()}`
		);

		this.SendMessage(
			{
				type: "new-user",
				payload: user,
			},
			"attachment-manager"
		);

		const nowString = new Date().toISOString();
		const userDTO: AltspaceUserDTO = {
			name: user.name,
			is_member: false,
			guid: user.id.toString(),
			created_at: nowString,
			updated_at: nowString,
		};
		const existingUserDTO =
			await this.repositoryManager.altspaceUserRepository.readByField(
				"name",
				user.name
			);
		if (!existingUserDTO) {
			this.repositoryManager.altspaceUserRepository.create(userDTO);
		} else {
			if (existingUserDTO.guid !== user.id.toString()) {
				this.repositoryManager.altspaceUserRepository.update({
					...existingUserDTO,
					guid: user.id.toString(),
					updated_at: nowString,
				});
			}
		}

		const userIsMember = this.membersList.some(
			(member) => member === user.name
		);

		if (userIsMember) {
			await this.guidMemberMap.set(user.id, {
				Id: user.id,
				Name: user.name,
			});
			await this.AddMember(user);
		}
	}

	public async RemoveUser(user: User): Promise<void> {
		if (await this.IsMember(user.id)) {
			await this.RemoveMember(user);
		}

		user.groups.clear();

		this.logHelper.info(
			"user-membership-manager",
			`Removing user: ${user.name}`
		);
	}

	public async AddMember(user: User): Promise<void> {
		const newMember = {
			Id: user.id,
			Name: user.name,
		};
		await this.guidMemberMap.set(user.id, newMember);
		user.groups.add("Member");
		this.logHelper.info(
			"user-membership-manager",
			`Adding user ${user.name} as new member`
		);

		this.SendMessage(
			{
				type: "new-member",
				payload: user,
			},
			"member-menu"
		);
	}

	public async RemoveMember(user: User): Promise<void> {
		await this.guidMemberMap.delete(user.id);
		user.groups.delete("Member");
		this.logHelper.info(
			"user-membership-manager",
			`Removing user ${user.name} as member`
		);

		this.SendMessage(
			{
				type: "bye-member",
				payload: user,
			},
			"member-menu"
		);
	}
}

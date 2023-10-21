import { Message } from "./Message";
import MessageBroker from "../models/MessageBroker";

export default abstract class MessageTrader {
    constructor(public traderName: string, protected messageBroker: MessageBroker) {
        this.messageBroker.Subscribe(this);
    }

    public AddSubscription(messageBroker: MessageBroker): void {
        this.messageBroker = messageBroker;
    }

    public DeleteSubscription(): void {
        delete this.messageBroker;
    }

    public abstract Update<U>(message: Message<U>): void;

    public SendMessage<U>(message: Message<U>, trader?: string): void {
        if (trader) { this.messageBroker.Notify(message, trader) } else { this.messageBroker.Notify(message); }
    }
}

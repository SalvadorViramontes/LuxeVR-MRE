import LogHelper from "../helpers/LogHelper";
import { Message } from "../contracts/Message";
import { LogVerbosity } from "../enums/LogVerbosity";
import MessageTrader from "../contracts/MessageTrader";

export default class MessageBroker {
    private subscribers: Record<string, MessageTrader> = {};
    
    constructor(
        private logHelper: LogHelper,
        private messageFormatter: (payload: any) => string = (payload: any) => payload.toString()
    ) { }

    public Subscribe(trader: MessageTrader){
        this.subscribers[trader.traderName] = trader;
        this.logHelper.info("message-broker", `Subscribing trader ${trader.traderName}`, LogVerbosity.Five);
        trader.AddSubscription(this);
    }

    public Unsuscribe(trader: MessageTrader) {
        this.subscribers[trader.traderName].DeleteSubscription();
        this.logHelper.info("message-broker", `Unsubscribing trader ${trader.traderName}`, LogVerbosity.Five);
        delete this.subscribers[trader.traderName];
    }

    public Notify<T>(
        message: Message<T>,
        traderName?: string
    ) {
        if(traderName){
            this.logHelper.info("message-broker", `Broadcasting message to ${traderName
            } => ${message.type}: ${this.messageFormatter(message.payload)}`, LogVerbosity.Five);
            this.subscribers[traderName].Update(message);
        } else{
            this.logHelper.info("message-broker", `Broadcasting global message => ${
                message.type}: ${this.messageFormatter(message.payload)}`, LogVerbosity.Five);
            Object.values(this.subscribers).forEach(trader => {
                trader.Update(message);
            });
        }
    }
}

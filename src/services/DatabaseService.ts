import LogHelper from "../helpers/LogHelper";
import { LogVerbosity } from "../enums/LogVerbosity";
import { PromiseReject } from '../types/promises/PromiseReject';
import { PromiseResolve } from '../types/promises/PromiseResolve';
import mysql, { Connection, ConnectionOptions } from "mysql2/promise";
import { GlobalConfigurationService } from "./GlobalConfigurationService";

export default class DatabaseService {
    private connection: Connection | null = null;
    private connectionOptions: ConnectionOptions;

    constructor(
        private globalConfigurationService: GlobalConfigurationService,
        private logHelper: LogHelper,
        protected promiseResolve: PromiseResolve<void>,
        protected promiseReject: PromiseReject,
    ){
        this.connectionOptions = this.globalConfigurationService.connectionOptions;
    }

    public async Initialize(): Promise<Connection> {
        this.logHelper.info("database-service", `Creating connection to database`, LogVerbosity.One);
        try{
            this.connection = await mysql.createConnection(this.connectionOptions);
            this.promiseResolve();
            this.logHelper.info("database-service", `Created connection to database`, LogVerbosity.One);
            return this.connection;
        } catch(e){
            this.logHelper.error('database-service', e);
            this.promiseReject(e);
        }
    }
}

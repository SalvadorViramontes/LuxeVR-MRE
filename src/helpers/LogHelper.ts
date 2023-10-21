import { ConsoleType } from '../types/ConsoleType';
import { LogVerbosity } from '../enums/LogVerbosity';
import { UserActionLog } from '../models/UserActionLog';
import RepositoryManager from '../managers/RepositoryManager';
import { log, User } from '@microsoft/mixed-reality-extension-sdk';
import { GlobalConfigurationService } from '../services/GlobalConfigurationService';

export default class LogHelper {
    constructor(
        private globalConfigurationService: GlobalConfigurationService,
        private repositoryManager: RepositoryManager
    ){ }

    private console(message: string, type: ConsoleType, verbosity: LogVerbosity) {
        if((verbosity as number) <= (this.globalConfigurationService.logVerbosity as number)) { console[type](message); }
    }

    public error(location: string, message: any){
        const consoleMessage = `${location} - ${message}`;
        log.error(location, message);
        this.console(consoleMessage, 'error', LogVerbosity.One);
    }
    
    public info(location: string, message: any, verbosity: LogVerbosity = LogVerbosity.Three){
        const consoleMessage = `${location} - ${message}`;
        log.info(location, message);
        this.console(consoleMessage, 'info', verbosity);
    }
    
    public warn(location: string, message: any){
        const consoleMessage = `${location} - ${message}`;
        log.warning(location, message);
        this.console(consoleMessage, 'warn', LogVerbosity.Three);
    }
    
    public userAction(user: User, action: string){
        const message = `${user.name}: ${action}`;
        log.info('user', message);
        this.console(message, 'log', LogVerbosity.One);
        this.repositoryManager.altspaceUserRepository.readByField('altspace_id', user.id.toString())
            .then(altspaceUser => {
                const newUserActionLog: UserActionLog = {
                    altspaceUser,
                    description: action
                }
                this.repositoryManager.userActionLogsRepository.create(newUserActionLog);
            })
    }
}

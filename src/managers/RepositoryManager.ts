import { Connection } from "mysql2/promise";
import LogHelper from "../helpers/LogHelper";
import { LogVerbosity } from "../enums/LogVerbosity";
import { CatchAll } from "../decorators/CatchDecorator";
import AltspaceUserRepository from "../databases/repositories/AltspaceUserRepository";

@CatchAll((err) => console.trace(err))
export default class RepositoryManager {
    private _altspaceUserRepository: AltspaceUserRepository;
    
    constructor(
        private logHelper: LogHelper
    ){}

    // #region Repository declaration
    get altspaceUserRepository(): AltspaceUserRepository {
        return this._altspaceUserRepository;
    }
    set altspaceUserRepository(repository: AltspaceUserRepository) {
        this._altspaceUserRepository = repository;
    }
    // #endregion

    public initialize(connection: Connection) {
        this.logHelper.info("repository-manager", `Initializing repositories`, LogVerbosity.One);
        this.altspaceUserRepository = new AltspaceUserRepository(
            connection,
            'altspace_users', [
                "name",
                "is_member",
                "guid",
                "created_at",
                "updated_at",
            ]
        );
        this.logHelper.info("repository-manager", `Initialized repositories`, LogVerbosity.One);
    }
}

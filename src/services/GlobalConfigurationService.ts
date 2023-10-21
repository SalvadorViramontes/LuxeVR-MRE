import { ConnectionOptions } from "mysql2/promise";
import { LogVerbosity } from "../enums/LogVerbosity";

export class GlobalConfigurationService {
    constructor(
        public isDebug: boolean = false,
        public logVerbosity: LogVerbosity = LogVerbosity.Three,
        public connectionOptions: ConnectionOptions
    ) {}
}

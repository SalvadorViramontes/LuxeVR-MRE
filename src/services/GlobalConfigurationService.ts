import { CreateAxiosDefaults } from "axios";
import { LogVerbosity } from "../enums/LogVerbosity";

export class GlobalConfigurationService {
    constructor(
        public isDebug: boolean = false,
        public logVerbosity: LogVerbosity = LogVerbosity.Three,
        public apiConnectionOptions: CreateAxiosDefaults
    ) {}
}

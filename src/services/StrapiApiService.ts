import axios, { AxiosInstance } from "axios";
import { GlobalConfigurationService } from "./GlobalConfigurationService";

export default class StrapiApiService {
    private instance: AxiosInstance;
    
    constructor(globalConfigurationService: GlobalConfigurationService) {
        this.instance = axios.create(globalConfigurationService.apiConnectionOptions);
    }

    getInstance(): AxiosInstance {
        return this.instance;
    }
}

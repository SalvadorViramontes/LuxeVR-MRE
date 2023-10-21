import dotenv from "dotenv";
import LuxeVrMre from "./app";
import { CreateAxiosDefaults } from "axios";
import { resolve as resolvePath } from "path";
import { LogVerbosity } from "./enums/LogVerbosity";
import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { GlobalConfigurationService } from "./services/GlobalConfigurationService";

process.on("uncaughtException", (err) =>
	console.trace("uncaughtException", err)
);
process.on("unhandledRejection", (reason) =>
	console.trace("unhandledRejection", reason)
);

dotenv.config();

const delay = 1000;
const isDebug = process.env.NODE_ENV !== "production";
const logVerbosity = (
	process.env.LOG_VERBOSITY &&
	[1, 2, 3, 4, 5].includes(+process.env.LOG_VERBOSITY)
		? process.env.LOG_VERBOSITY
		: 3
) as LogVerbosity;
const apiConnectionOptions: CreateAxiosDefaults = {
	baseURL: process.env.STRAPI_API_HOST,
	timeout: 0,
	responseType: "json",
	headers: {
		Accept: `application/json`,
		Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
	},
};

const configuration = new GlobalConfigurationService(
	isDebug,
	logVerbosity,
	apiConnectionOptions
);

function runApp() {
	const server = new MRE.WebHost({
		baseDir: resolvePath(__dirname, "../public"),
	});

	server.adapter.onConnection(
		(context) => new LuxeVrMre(context, configuration)
	);
}

if (isDebug) {
	setTimeout(runApp, delay);
} else {
	runApp();
}

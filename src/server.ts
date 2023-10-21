import dotenv from "dotenv";
import LuxeVrMre from "./app";
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
const connectionOptions = {
	host: process.env.MY_SQL_DB_HOST,
	user: process.env.MY_SQL_DB_USER,
	password: process.env.MY_SQL_DB_PASSWORD,
	port: Number(process.env.MY_SQL_DB_PORT),
	database: process.env.MY_SQL_DB_DATABASE,
};

const configuration = new GlobalConfigurationService(
	isDebug,
	logVerbosity,
	connectionOptions
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

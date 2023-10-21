import { JsUtilities } from "../utils/JsUtilities";
import { ResourceType } from "../types/ResourceType";
import { Prefab } from "@microsoft/mixed-reality-extension-sdk";

export class Resource {
	private __resource: ResourceType;

	constructor(resource: ResourceType) {
		this.__resource = resource;
	}

	get resource(): ResourceType {
		return this.__resource;
	}

	set resource(value: ResourceType) {
		this.__resource = value;
	}

	get id(): string {
		if (JsUtilities.IsObject(this.__resource)) {
			return (this.__resource as Prefab).id.toString();
		} else {
			return this.__resource as string;
		}
	}
}

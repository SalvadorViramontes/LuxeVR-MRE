import { Vector3Like } from "@microsoft/mixed-reality-extension-sdk";

export type AssetTransform = {
	id?: number;
	position: Vector3Like & {id?: number};
	rotation: Vector3Like & {id?: number};
    scale: Vector3Like & {id?: number};
}

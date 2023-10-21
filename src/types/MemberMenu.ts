import { PanelTile } from "../models/PanelTile";
import { PanelAssetsType } from "./PanelAssetsType";
import { PanelButtonsType } from "./PanelButtonsType";
import { Actor, Guid } from "@microsoft/mixed-reality-extension-sdk";

export type MemberMenu = {
	MemberId: Guid;
	ShowAssets: boolean;
	VrButton?: Actor;
	Page: number;
	PanelAssets?: PanelAssetsType;
	PanelButtons?: PanelButtonsType;
	PanelTiles?: PanelTile[];
};

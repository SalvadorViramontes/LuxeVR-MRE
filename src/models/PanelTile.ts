import { Actor } from "@microsoft/mixed-reality-extension-sdk";

export interface PanelTile {
    AnchorActor: Actor;
    AnchorDebugger?: Actor;
    AssetActor: Actor;
    AssetButton: Actor;
    ControlActor: Actor;
    ControlButtons: Actor[];
}

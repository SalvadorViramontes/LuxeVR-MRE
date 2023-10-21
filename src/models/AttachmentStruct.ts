import { Nullable } from "../types/Generics";
import { AttachmentPoint } from "../enums/AttachmentPoint";
import {Actor, Guid} from '@microsoft/mixed-reality-extension-sdk';
import { CatchAll } from "../decorators/CatchDecorator";

type AttachmentStructType = Record<AttachmentPoint, Nullable<Actor>>;

export default class AttachmentStruct {
    private __struct: AttachmentStructType;

    @CatchAll((err) => console.trace(err))
    private static newStruct(): AttachmentStructType {
        const struct: AttachmentStructType = {
            none: null,
            camera: null,
            head: null,
            neck: null,
            hips: null,
            "center-eye": null,
            "spine-top": null,
            "spine-middle": null,
            "spine-bottom": null,
            "left-eye": null,
            "left-upper-leg": null,
            "left-lower-leg": null,
            "left-foot": null,
            "left-toes": null,
            "left-shoulder": null,
            "left-upper-arm": null,
            "left-lower-arm": null,
            "left-hand": null,
            "left-thumb": null,
            "left-index": null,
            "left-middle": null,
            "left-ring": null,
            "left-pinky": null,
            "right-eye": null,
            "right-upper-leg": null,
            "right-lower-leg": null,
            "right-foot": null,
            "right-toes": null,
            "right-shoulder": null,
            "right-upper-arm": null,
            "right-lower-arm": null,
            "right-hand": null,
            "right-thumb": null,
            "right-index": null,
            "right-middle": null,
            "right-ring": null,
            "right-pinky": null
        };

        return struct;
    }

    public get allActorIds(): Guid[] {
        return Object.values(this.__struct)
            .map(point => {
                return point?.id ?? null;
            })
            .filter(id => !!id);
    }

    constructor() {
        this.__struct = AttachmentStruct.newStruct();
    }

    RemoveAttachment(attachmentPoint: AttachmentPoint): void {
        if(this.HasAttachment(attachmentPoint)){
            this.__struct[attachmentPoint].destroy();
            this.__struct[attachmentPoint] = null;
        }
    }

    GetAttachment(attachmentPoint: AttachmentPoint) {
        return this.__struct[attachmentPoint];
    }

    AddAttachment(attachmentPoint: AttachmentPoint, actor: Actor): void {
        this.RemoveAttachment(attachmentPoint);
        this.__struct[attachmentPoint] = actor;
    }

    HasAttachment(attachmentPoint: AttachmentPoint): boolean {
        return !!this.__struct[attachmentPoint];
    }

    RemoveAllAttachments(): void {
        Object.values(AttachmentPoint).forEach(attachmentPoint => {
            this.RemoveAttachment(attachmentPoint);
        });
    }
}

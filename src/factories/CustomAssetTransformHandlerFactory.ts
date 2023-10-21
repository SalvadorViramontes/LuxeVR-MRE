import {
    PositionXDownAssetTransformHandler,
    PositionXUpAssetTransformHandler,
    PositionYDownAssetTransformHandler,
    PositionYUpAssetTransformHandler,
    PositionZDownAssetTransformHandler,
    PositionZUpAssetTransformHandler,
    ScaleDownAssetTransformHandler,
    ScaleUpAssetTransformHandler
} from '../handlers/CustomAssetTransformHandlers';
import { CatchAll } from '../decorators/CatchDecorator';
import { DeltaTransformValues } from '../models/DeltaTransformValues';
import { CustomAssetTransformType } from "../enums/CustomAssetTransformType";
import CustomAssetTransformHandler from "../contracts/CustomAssetTransformHandler";

export default class CustomAssetTransformHandlerFactory {
    private _deltaTransformValues: DeltaTransformValues;

    static HandlerRecord: Record<string, typeof CustomAssetTransformHandler> = {
        "ScaleUp": ScaleUpAssetTransformHandler,
        "ScaleDown": ScaleDownAssetTransformHandler,
        "PositionXUp": PositionXUpAssetTransformHandler,
        "PositionXDown": PositionXDownAssetTransformHandler,
        "PositionYUp": PositionYUpAssetTransformHandler,
        "PositionYDown": PositionYDownAssetTransformHandler,
        "PositionZUp": PositionZUpAssetTransformHandler,
        "PositionZDown": PositionZDownAssetTransformHandler,
    };

    get deltaTransformValues(): DeltaTransformValues {
        return this._deltaTransformValues;
    }
    set deltaTransformValues(values: DeltaTransformValues) {
        this._deltaTransformValues = values;
    }

    @CatchAll((err) => console.trace(err))
    public GetHandler(transformType: CustomAssetTransformType): CustomAssetTransformHandler {
        const transformName = transformType as unknown as string;
        const customAssetTransformHandler = CustomAssetTransformHandlerFactory.HandlerRecord[transformName];
        return new customAssetTransformHandler(this.deltaTransformValues);
    }
}

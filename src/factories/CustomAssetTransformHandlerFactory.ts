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
import { CustomAssetTransformType } from "../enums/CustomAssetTransformType";
import CustomAssetTransformHandler from "../contracts/CustomAssetTransformHandler";

export default class CustomAssetTransformHandlerFactory {
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

    @CatchAll((err) => console.trace(err))
    static GetHandler(transformType: CustomAssetTransformType): CustomAssetTransformHandler {
        const transformName = transformType as unknown as string;
        const customAssetTransformHandler = CustomAssetTransformHandlerFactory.HandlerRecord[transformName];
        return new customAssetTransformHandler();
    }
}

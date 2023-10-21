import { AssetTransform } from "../types/descriptors/AssetTransform";
import { DeltaTransformValues } from "../models/DeltaTransformValues";

export default class CustomAssetTransformHandler {
    constructor(protected deltaTransformValues: DeltaTransformValues){}

    public TransformCoordinates(_customTransform: AssetTransform): AssetTransform {
        return {
            scale: { x: 0, y: 0, z: 0 },
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
        }
    }

    public DescribeTransformation(_customTransform: AssetTransform): string {
        return 'No transform';
    }
}

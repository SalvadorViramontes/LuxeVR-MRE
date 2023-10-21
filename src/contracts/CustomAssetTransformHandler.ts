import { CustomAssetTransform } from "../models/CustomAssetTransform";

export default class CustomAssetTransformHandler {
    public TransformCoordinates(_customTransform: CustomAssetTransform): CustomAssetTransform {
        return {
            scale: 1,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
        }
    }

    public DescribeTransformation(_customTransform: CustomAssetTransform): string {
        return 'No transform';
    }
}

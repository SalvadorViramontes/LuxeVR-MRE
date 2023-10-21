import { AssetTransform } from "../types/descriptors/AssetTransform";
import CustomAssetTransformHandler from "../contracts/CustomAssetTransformHandler";

class ScaleUpAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: AssetTransform): AssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.scale.x *= this.deltaTransformValues.scaleUp;
        newCustomAssetTransform.scale.y *= this.deltaTransformValues.scaleUp;
        newCustomAssetTransform.scale.z *= this.deltaTransformValues.scaleUp;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: AssetTransform): string {
        return `Modified scale value up to ${customTransform.scale.x}`;
    }
}

class ScaleDownAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: AssetTransform): AssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.scale.x *= this.deltaTransformValues.scaleDown;
        newCustomAssetTransform.scale.y *= this.deltaTransformValues.scaleDown;
        newCustomAssetTransform.scale.z *= this.deltaTransformValues.scaleDown;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: AssetTransform): string {
        return `Modified scale value down to ${customTransform.scale.x}`;
    }
}

class PositionXUpAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: AssetTransform): AssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.x += this.deltaTransformValues.x;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: AssetTransform): string {
        return `Modified 'X' position value up to ${customTransform.position.x}`;
    }
}

class PositionXDownAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: AssetTransform): AssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.x -= this.deltaTransformValues.x;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: AssetTransform): string {
        return `Modified 'X' position value down to ${customTransform.position.x}`;
    }
}

class PositionYUpAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: AssetTransform): AssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.y += this.deltaTransformValues.y;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: AssetTransform): string {
        return `Modified 'Y' position value up to ${customTransform.position.y}`;
    }
}

class PositionYDownAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: AssetTransform): AssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.y -= this.deltaTransformValues.y;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: AssetTransform): string {
        return `Modified 'Y' position value down to ${customTransform.position.y}`;
    }
}

class PositionZUpAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: AssetTransform): AssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.z += this.deltaTransformValues.z;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: AssetTransform): string {
        return `Modified 'Z' position value up to ${customTransform.position.z}`;
    }
}

class PositionZDownAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: AssetTransform): AssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.z -= this.deltaTransformValues.z;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: AssetTransform): string {
        return `Modified 'Z' position value down to ${customTransform.position.z}`;
    }
}

export {
    ScaleUpAssetTransformHandler,
    ScaleDownAssetTransformHandler,
    PositionXUpAssetTransformHandler,
    PositionXDownAssetTransformHandler,
    PositionYUpAssetTransformHandler,
    PositionYDownAssetTransformHandler,
    PositionZUpAssetTransformHandler,
    PositionZDownAssetTransformHandler,
}

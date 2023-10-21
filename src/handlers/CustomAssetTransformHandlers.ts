import { CustomAssetTransform } from "../models/CustomAssetTransform";
import CustomAssetTransformHandler from "../contracts/CustomAssetTransformHandler";
import { deltaTransformValues } from "../constants/configuration/deltaTransformValues";

class ScaleUpAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: CustomAssetTransform): CustomAssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.scale *= deltaTransformValues.scaleUp;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: CustomAssetTransform): string {
        return `Modified scale value up to ${customTransform.scale}`;
    }
}

class ScaleDownAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: CustomAssetTransform): CustomAssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.scale *= deltaTransformValues.scaleDown;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: CustomAssetTransform): string {
        return `Modified scale value down to ${customTransform.scale}`;
    }
}

class PositionXUpAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: CustomAssetTransform): CustomAssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.x += deltaTransformValues.x;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: CustomAssetTransform): string {
        return `Modified 'X' position value up to ${customTransform.scale}`;
    }
}

class PositionXDownAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: CustomAssetTransform): CustomAssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.x -= deltaTransformValues.x;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: CustomAssetTransform): string {
        return `Modified 'X' position value down to ${customTransform.scale}`;
    }
}

class PositionYUpAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: CustomAssetTransform): CustomAssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.y += deltaTransformValues.y;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: CustomAssetTransform): string {
        return `Modified 'Y' position value up to ${customTransform.scale}`;
    }
}

class PositionYDownAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: CustomAssetTransform): CustomAssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.y -= deltaTransformValues.y;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: CustomAssetTransform): string {
        return `Modified 'Y' position value down to ${customTransform.scale}`;
    }
}

class PositionZUpAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: CustomAssetTransform): CustomAssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.z += deltaTransformValues.z;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: CustomAssetTransform): string {
        return `Modified 'Z' position value up to ${customTransform.scale}`;
    }
}

class PositionZDownAssetTransformHandler extends CustomAssetTransformHandler {
    public TransformCoordinates(customTransform: CustomAssetTransform): CustomAssetTransform {
        const newCustomAssetTransform = {...customTransform};
        newCustomAssetTransform.position.z -= deltaTransformValues.z;
        return newCustomAssetTransform; 
    }

    public DescribeTransformation(customTransform: CustomAssetTransform): string {
        return `Modified 'Z' position value down to ${customTransform.scale}`;
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

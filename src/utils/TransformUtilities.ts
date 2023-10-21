import {
	DegreesToRadians,
	Quaternion,
	ScaledTransformLike,
	Vector3,
	Vector3Like,
} from "@microsoft/mixed-reality-extension-sdk";
import { Coordinate } from "../enums/Coordinate";
import { CatchAll } from "../decorators/CatchDecorator";
import { AssetTransform } from "../types/descriptors/AssetTransform";
import { CustomAssetTransform } from "../models/CustomAssetTransform";

export class TransformUtilities {
	@CatchAll((err) => console.trace(err))
	private static RotationWrapper(
		rotationEulerAngles: Vector3Like
	): Quaternion {
		return Quaternion.FromEulerAngles(
			rotationEulerAngles.x * DegreesToRadians,
			rotationEulerAngles.y * DegreesToRadians,
			rotationEulerAngles.z * DegreesToRadians
		);
	}

	@CatchAll((err) => console.trace(err))
	private static RotateVectorByQuaternion(
		vector: Vector3,
		quaternion: Quaternion
	): Vector3 {
		const vectorQuaternion = new Quaternion(
			vector.x,
			vector.y,
			vector.z,
			0
		);
		const rotatedNormalQuaternion = quaternion
			.multiply(vectorQuaternion)
			.multiply(Quaternion.Inverse(quaternion));
		return new Vector3(
			rotatedNormalQuaternion.x,
			rotatedNormalQuaternion.y,
			rotatedNormalQuaternion.z
		);
	}

	@CatchAll((err) => console.trace(err))
	private static ProjectScaleOntoPlane(
		scale: Vector3Like,
		quaternionRotation: Quaternion,
		aNormalVector?: Vector3
	): Vector3Like {
		if (aNormalVector) {
			if (aNormalVector.length() - 1 > 0.0001) {
				throw new Error("Normal vector does not have length 1");
			}
		}

		const normalVector = TransformUtilities.RotateVectorByQuaternion(
			aNormalVector || new Vector3(1, 0, 0),
			quaternionRotation
		);

		const scaleVector = new Vector3(scale.x, scale.y, scale.z);
		const dotScale = Vector3.Dot(scaleVector, normalVector);
		const vectorSubtract = normalVector.scale(dotScale);
		const projectionVector = scaleVector.subtract(vectorSubtract);

		return {
			x: Math.max(projectionVector.x, scale.x * 0.003),
			y: Math.max(projectionVector.y, scale.y * 0.003),
			z: Math.max(projectionVector.z, scale.z * 0.003),
		};
	}

	@CatchAll((err) => console.trace(err))
	private static ProjectRotationOntoPlane(
		rotation: Vector3Like,
		aNormalVector?: Vector3
	): Vector3Like {
		const normalVector = aNormalVector || new Vector3(1, 0, 0);
		const rotationVector = new Vector3(rotation.x, rotation.y, rotation.z);
		const dotScale = Vector3.Dot(rotationVector, normalVector);
		const vectorSubtract = normalVector.scale(dotScale);
		const projectionVector = rotationVector.subtract(vectorSubtract);

		return {
			x: projectionVector.x,
			y: projectionVector.y,
			z: projectionVector.z,
		};
	}

	@CatchAll((err) => console.trace(err))
	private static FlipCoordinate(
		vectorLike: Vector3Like,
		coordinate: Coordinate
	): Vector3Like {
		const newVectorLike = JSON.parse(JSON.stringify(vectorLike));
		newVectorLike[coordinate] = -1 * newVectorLike[coordinate];
		return newVectorLike;
	}

	@CatchAll((err) => console.trace(err))
	public static AnchorWrapper(position: Vector3Like): ScaledTransformLike {
		return {
			scale: { x: 1, y: 1, z: 1 },
			rotation: TransformUtilities.RotationWrapper({ x: 0, y: 0, z: 0 }),
			position,
		};
	}

	@CatchAll((err) => console.trace(err))
	public static PanelAnchorDebugWrapper(
		scale: Vector3Like,
		position: Vector3Like
	): ScaledTransformLike {
		return {
			scale,
			rotation: TransformUtilities.RotationWrapper({ x: 0, y: 0, z: 0 }),
			position,
		};
	}

	@CatchAll((err) => console.trace(err))
	public static LocalAnchorTransform(
		assetTransform: AssetTransform,
		anchorPosition: Vector3Like
	): ScaledTransformLike {
		const newAssetTransform = { ...assetTransform };
		newAssetTransform.position = {
			x: assetTransform.position.x - anchorPosition.x,
			y: assetTransform.position.y - anchorPosition.y,
			z: assetTransform.position.z - anchorPosition.z,
		};
		return TransformUtilities.TransformWrapper(newAssetTransform);
	}

	@CatchAll((err) => console.trace(err))
	public static LocalControlHeightWrapper(
		assetTransform: AssetTransform,
		height: number
	): ScaledTransformLike {
		const newAssetTransform = JSON.parse(
			JSON.stringify(assetTransform)
		) as AssetTransform;
		newAssetTransform.position.y += height;
		return TransformUtilities.TransformWrapper(newAssetTransform);
	}

	@CatchAll((err) => console.trace(err))
	public static PanelControlWidthWrapper(
		assetTransform: AssetTransform,
		position: number
	): ScaledTransformLike {
		const newAssetTransform = JSON.parse(
			JSON.stringify(assetTransform)
		) as AssetTransform;
		newAssetTransform.position =
			position < 3
				? newAssetTransform.position
				: TransformUtilities.FlipCoordinate(
						newAssetTransform.position,
						Coordinate.Z
				  );
		return TransformUtilities.TransformWrapper(newAssetTransform);
	}

	@CatchAll((err) => console.trace(err))
	public static TransformWrapper(
		assetTransform: AssetTransform
	): ScaledTransformLike {
		return {
			scale: assetTransform.scale,
			rotation: TransformUtilities.RotationWrapper(
				assetTransform.rotation
			),
			position: assetTransform.position,
		};
	}

	@CatchAll((err) => console.trace(err))
	public static PanelIconTransformWrapper(
		assetTransform: AssetTransform,
		position: number
	): ScaledTransformLike {
		const rotationQuaternion = TransformUtilities.RotationWrapper(
			assetTransform.rotation
		);
		const projectedRotation = TransformUtilities.ProjectRotationOntoPlane(
			assetTransform.rotation
		);
		const projectedScale = TransformUtilities.ProjectScaleOntoPlane(
			assetTransform.scale,
			rotationQuaternion
		);
		return {
			scale: projectedScale,
			rotation: TransformUtilities.RotationWrapper(projectedRotation),
			position:
				position < 3
					? assetTransform.position
					: TransformUtilities.FlipCoordinate(
							assetTransform.position,
							Coordinate.Z
					  ),
		};
	}

	@CatchAll((err) => console.trace(err))
	public static PanelButtonTransformWrapper(
		assetTransform: AssetTransform,
		position: number
	): ScaledTransformLike {
		return {
			scale: assetTransform.scale,
			rotation: TransformUtilities.RotationWrapper(
				assetTransform.rotation
			),
			position:
				position < 3
					? assetTransform.position
					: TransformUtilities.FlipCoordinate(
							assetTransform.position,
							Coordinate.Z
					  ),
		};
	}

	@CatchAll((err) => console.trace(err))
	public static CustomTransformWrapper(
		customTransform: CustomAssetTransform
	): ScaledTransformLike {
		return {
			scale: {
				x: customTransform.scale,
				y: customTransform.scale,
				z: customTransform.scale,
			},
			rotation: TransformUtilities.RotationWrapper(
				customTransform.rotation
			),
			position: customTransform.position,
		};
	}
}

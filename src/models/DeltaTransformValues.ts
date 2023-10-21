import { Model } from "./_Model";

export interface DeltaTransformValues extends Model {
    x: number;
    y: number;
    z: number;
    scaleUp: number;
    scaleDown: number;
}

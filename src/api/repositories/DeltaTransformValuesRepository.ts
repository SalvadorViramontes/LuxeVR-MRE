import { AxiosInstance } from "axios";
import StrapiRepository from "./_StrapiRepository";
import { StrapiModel } from "../models/_StrapiModel";
import { DeltaTransformValues } from "../../models/DeltaTransformValues";
import { DeltaTransformValuesDTO } from "../models/DeltaTransformValues.dto";

export default class DeltaTransformValuesRepository extends StrapiRepository<DeltaTransformValues, DeltaTransformValuesDTO>{
    constructor(
        instance: AxiosInstance,
    ) {
        super(
            instance,
            'delta-transform-value',
            (model: Partial<DeltaTransformValues>): Partial<DeltaTransformValuesDTO> => {
                const dto = {
                    x: model.x,
                    y: model.y,
                    z: model.z,
                    scaleUp: model.scaleUp,
                    scaleDown: model.scaleDown
                };
                return dto;
            },
            (dtoWrap: StrapiModel<DeltaTransformValuesDTO>): DeltaTransformValues => {
                return {
                    id: dtoWrap.id,
                    x: dtoWrap.attributes.x,
                    y: dtoWrap.attributes.y,
                    z: dtoWrap.attributes.z,
                    scaleUp: dtoWrap.attributes.scaleUp,
                    scaleDown: dtoWrap.attributes.scaleDown
                };
            }
        )
    }
}

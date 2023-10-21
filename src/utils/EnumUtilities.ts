import { CatchAll } from "../decorators/CatchDecorator";

export default class EnumUtilities {
	/**
	 * Static function that returns the enum value name based on an enum value
	 * @param {Enum} anEnum - Any type of Typescript enum
	 * @param {string | number} aValue - The enum string or number value
	 */
	@CatchAll((err) => console.trace(err))
	static getEnumName<E, K extends string | number>(
		anEnum: { [key in K]: E },
		aValue: string | number
	): string {
		const indexOf = Object.values(anEnum).indexOf(
			aValue as unknown as typeof anEnum
		);
		return Object.keys(anEnum)[indexOf];
	}

	@CatchAll((err) => console.trace(err))
	static getEnumKeyIterable<E, K extends string | number>(anEnum: {
		[key in K]: E;
	}): string[] {
		return Object.keys(anEnum).filter((key) => isNaN(Number(key)));
	}
}

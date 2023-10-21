export class JsUtilities {
    static IsObject(variable: any): boolean {
        return typeof variable === 'object' &&
            variable !== null &&
            !Array.isArray(variable)
    }
}

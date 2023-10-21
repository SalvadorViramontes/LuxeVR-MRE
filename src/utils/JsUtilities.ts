export class JsUtilities {
    static IsObject(variable: any): boolean {
        return typeof variable === 'object' &&
            variable !== null &&
            !Array.isArray(variable)
    }

    static delay(ms: number): Promise<void> {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}

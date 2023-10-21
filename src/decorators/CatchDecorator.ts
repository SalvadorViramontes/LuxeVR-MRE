import { HandlerFunction } from "../types/HandlerFunction";

function ErrorHandler(ctx: any, errorType: any, handler: HandlerFunction, error: Error) {
    if (typeof handler === 'function' && error instanceof errorType) {
        handler.call(null, error, ctx);
    } else {
        throw error;
    }
}

function generateDescriptor(
    descriptor: PropertyDescriptor,
    errorType: any,
    handler: HandlerFunction
): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
        try{
            const result = originalMethod.apply(this, args);

            if(result && result instanceof Promise) {
                return result.catch((error) => {
                    ErrorHandler(this, errorType, handler, error as Error);
                });
            } else {
                return result;
            }
        } catch(error) {
            ErrorHandler(this, errorType, handler, error as Error);
        }
    };

    return descriptor;
}

export const CatchMethod = (
    errorType: any,
    handler: HandlerFunction
): any => {
    return (
        target: any,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) => {
        if(descriptor) { return generateDescriptor(descriptor, errorType, handler); } else {
            // const allProperties = Reflect.ownKeys(target.prototype).filter(prop => prop !== 'constructor');
            const allProperties = Reflect.ownKeys(target.prototype);
            for(const propertyName of allProperties) {
                const desc = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
                const isMethod = desc.value instanceof Function;
                if(!isMethod) { continue; }
                Object.defineProperty(target.prototype, propertyName, generateDescriptor(desc, errorType, handler));
            }
        }
    }
};

export const CatchAll = (handler: HandlerFunction): any => CatchMethod(Error, handler);

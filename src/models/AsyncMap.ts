export default class AsyncMap<K, V> {
    private __map = new Map<K, V>();
    
    async clear(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try{
                const that = this.__map.clear();
                resolve(that);
            } catch(err) {
                reject(err);
            }
        })
    }

    async delete(key: K): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try{
                const that = this.__map.delete(key);
                resolve(that);
            } catch(err) {
                reject(err);
            }
        });
    }

    async forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try{
                const that = this.__map.forEach(callbackfn, thisArg);
                resolve(that);
            } catch(err) {
                reject(err);
            }
        });
    }

    async get(key: K): Promise<V | undefined> {
        return new Promise<V | undefined>((resolve, reject) => {
            try{
                const that = this.__map.get(key);
                resolve(that);
            } catch(err) {
                reject(err);
            }
        });
    }

    async has(key: K): Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            try{
                const that = this.__map.has(key);
                resolve(that);
            } catch(err) {
                reject(err);
            }
        });
    }

    async set(key: K, value: V): Promise<this>{
        return new Promise<this>((resolve, reject) => {
            try{
                this.__map.set(key, value);
                resolve(this);
            } catch(err) {
                reject(err);
            }
        });
    }

    get size(): number{
        return this.__map.size;
    }
}

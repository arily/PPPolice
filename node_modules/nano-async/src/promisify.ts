export function promisify(method: (...args: any[]) => any): any {
    return (...args: any[]) => {
        return new Promise((resolve, reject) => {
            args.push((err: any, ...result: any[]) => {
                if (!err) {
                    resolve(result);
                } else {
                    reject(err);
                }
            });

            method.apply(this, args);
        });
    };
}

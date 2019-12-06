import * as chai from "chai"
const { expect } = chai

import { promisify } from "./promisify"

describe("promisify", () => {
    const err = new Error("My error")
    function myFunc (a: string, b: number, throwError: boolean, callback: (err: Error, param1?: any, param2?: any) => {}) {
        if (throwError) {
            callback(err)
        } else {
            callback(null, a, b)
        }
    }
    it("should return function that returns a promise that is resolved if called appropriately", () => {
        const promisifiedMyFunc = promisify(myFunc)
        return promisifiedMyFunc("alfa", "beta", false)
               .then((result: string) => {
                   expect(result).to.deep.equal(["alfa", "beta"])
                   return true
               })
    })
    it("should return function that returns a promise that is rejected if called appropriately", (done) => {
        const promisifiedMyFunc = promisify(myFunc)
        promisifiedMyFunc("alfa", "beta", true)
        .then((result: any) => {
            done(new Error("This should not happen"))
        })
        .catch((_err: Error) => {
            expect(_err).to.equal(err)
            done()
        })
    })

})
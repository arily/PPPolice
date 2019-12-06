import * as chai from "chai"
const { expect } = chai
import nanoFactory = require("nano");

import { isServerScope } from "./isServerScope"

describe("isServerScope", () => {
    it("should return true if a ServerScope is passed", () => {
        const serverScope = nanoFactory("http://localhost:5984")
        const result = isServerScope(serverScope)
        expect(result).to.be.true
    })
    it("should return false if a DocumentScope is passed", () => {
        const serverScope = nanoFactory("http://localhost:5984/mydb")
        const result = isServerScope(serverScope)
        expect(result).to.be.false
    })
})
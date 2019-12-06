import * as chai from "chai"
const { expect } = chai
import * as sinon from 'sinon';

import * as Nano from "nano"
import { Request } from "request"
import { Wrapper } from "./Wrapper"

describe("Wrapper", () => {
    it("wrapServerScope", () => {
        const dbName = 'mydb'
        const databaseScope = { } as Nano.DatabaseScope
        const serverScope = {
            use: (_dbName) => { expect(_dbName).to.equal(dbName) },
            db: databaseScope
        } as Nano.ServerScope
        const serverScopeAsync = Wrapper.wrapServerScope(serverScope)
        expect(serverScopeAsync).to.have.property("db").that.is.an("Object")
        expect(serverScopeAsync).to.have.property("scope").that.is.a("Function")
        expect(serverScopeAsync).to.have.property("authAsync").that.is.a("Function")
        expect(serverScopeAsync).to.have.property("sessionAsync").that.is.a("Function")
        expect(serverScopeAsync).to.have.property("updatesAsync").that.is.a("Function")
        expect(serverScopeAsync).to.have.property("uuidsAsync").that.is.a("Function")
    })
    describe("wrapDatabaseScope", () => {
        const headers = { header: "value" }
        const createResponse = { ok: true } as Nano.DatabaseCreateResponse
        const getResponse = {} as Nano.DatabaseGetResponse
        const destroyResponse = {} as Nano.OkResponse
        const listResponse = {} as string[]
        const compactResponse = {} as Nano.OkResponse
        const replicateResponse = {} as Nano.DatabaseReplicateResponse
        const changesResponse = {} as Nano.DatabaseChangesResponse
        const updatesResponse = {} as Nano.DatabaseUpdatesResponse

        function compact(name: string, callback?: Nano.Callback<Nano.OkResponse>): Request
        function compact(name: string, designname: string, callback?: Nano.Callback<Nano.OkResponse>): Request
        function compact(name: string, arg2?: string | Nano.Callback<Nano.OkResponse>, arg3?: Nano.Callback<Nano.OkResponse>): Request {
            const callback = typeof arg2 === "function" ? arg2 : arg3
            if (callback) {
                callback(null, compactResponse, headers);
            }
            return {} as Request
        }

        function replicate<D>(source: string | Nano.DocumentScope <D>, target: string | Nano.DocumentScope <D>,
                              callback?: Nano.Callback<Nano.DatabaseReplicateResponse>): Request
        function replicate<D>(source: string | Nano.DocumentScope <D>, target: string | Nano.DocumentScope <D>,
                              options: Nano.DatabaseReplicateOptions, callback?: Nano.Callback<Nano.DatabaseReplicateResponse>): Request
        function replicate<D>(source: string | Nano.DocumentScope<D>, target: string | Nano.DocumentScope<D>,
                              arg3?: Nano.DatabaseReplicateOptions | Nano.Callback<Nano.DatabaseReplicateResponse>,
                              arg4?: Nano.Callback<Nano.DatabaseReplicateResponse>): Request {
            const callback = typeof arg3 === "function" ? arg3 : arg4
            if (callback) {
                callback(null, replicateResponse, headers)
            }
            return {} as Request
        }

        function changes(name: string, callback?: Nano.Callback<Nano.DatabaseChangesResponse>): Request
        function changes(name: string, params: Nano.DatabaseChangesParams, callback?: Nano.Callback<Nano.DatabaseChangesResponse>): Request
        function changes(name: string, arg2?: Nano.DatabaseChangesParams | Nano.Callback<Nano.DatabaseChangesResponse>,
                                       arg3?: Nano.Callback<Nano.DatabaseChangesResponse>): Request {
            const callback = typeof arg2 === "function" ? arg2 : arg3
            if (callback) {
                callback(null, changesResponse, headers)
            }
            return {} as Request
        }

        function updates(callback?: Nano.Callback<Nano.DatabaseUpdatesResponse>): Request
        function updates(params: Nano.UpdatesParams, callback?: Nano.Callback<Nano.DatabaseUpdatesResponse>): Request
        function updates(arg1?: Nano.UpdatesParams | Nano.Callback<Nano.DatabaseUpdatesResponse>,
                         arg2?: Nano.Callback<Nano.DatabaseUpdatesResponse>): Request {
            const callback = typeof arg1 === "function" ? arg1 : arg2
            if (callback) {
                callback(null, updatesResponse, headers)
            }
            return {} as Request
        }

        const databaseScope = {} as Nano.DatabaseScope
        databaseScope.use = <D>(name: string): Nano.DocumentScope<D> => {
            return {} as Nano.DocumentScope<D>
        }
        databaseScope.create = (name: string, callback: Nano.Callback<Nano.DatabaseCreateResponse>): Request => {
            callback(null, createResponse, headers)
            return {} as Request
        }
        databaseScope.get = (name: string, callback: Nano.Callback<Nano.DatabaseGetResponse>): Request => {
            callback(null, getResponse, headers)
            return {} as Request
        }
        
        databaseScope.destroy = (name: string, callback: Nano.Callback<Nano.OkResponse>): Request => {
            callback(null, destroyResponse, headers)
            return {} as Request
        }

        databaseScope.list = (callback: Nano.Callback<string[]>): Request => {
            callback(null, listResponse, headers)
            return {} as Request
        }
        
        databaseScope.compact = compact
        databaseScope.replicate = replicate
        databaseScope.changes = changes
        databaseScope.updates = updates

        const databaseScopeAsync = Wrapper.wrapDatabaseScope(databaseScope)

        it("the created DatabaseScopeAsync should have all Async suffixed methods", () => {
            expect(databaseScopeAsync).to.have.property("createAsync").that.is.a("Function")
            expect(databaseScopeAsync).to.have.property("getAsync").that.is.a("Function")
            expect(databaseScopeAsync).to.have.property("destroyAsync").that.is.a("Function")
            expect(databaseScopeAsync).to.have.property("listAsync").that.is.a("Function")
            expect(databaseScopeAsync).to.have.property("compactAsync").that.is.a("Function")
            expect(databaseScopeAsync).to.have.property("replicateAsync").that.is.a("Function")
            expect(databaseScopeAsync).to.have.property("changesAsync").that.is.a("Function")
            expect(databaseScopeAsync).to.have.property("updatesAsync").that.is.a("Function")
        })

        it("createAsync method should pass all arguments to create method", () => {
            const dbName = "mydb"
            const databaseScopeCreate = sinon.spy(databaseScope, "create")
            return databaseScopeAsync.createAsync(dbName)
                    .then(([_response, _headers]) => {
                        expect(databaseScopeCreate.calledOnce)
                        expect(databaseScopeCreate.calledWith(dbName))
                        expect(_response).to.equal(createResponse)
                        expect(_headers).to.equal(headers)
                    })
        })
        it("getAsync method should pass all arguments to get method", () => {
            const dbName = "mydb"
            const get = sinon.spy(databaseScope, "get")
            return databaseScopeAsync.getAsync(dbName)
                    .then(([_response, _headers]) => {
                        expect(get.calledOnce)
                        expect(get.calledWith(dbName))
                        expect(_response).to.equal(getResponse)
                        expect(_headers).to.equal(headers)
                    })
        })
        it("destroyAsync method should pass all arguments to destroy method", () => {
            const dbName = "mydb"
            const destroy = sinon.spy(databaseScope, "destroy")
            return databaseScopeAsync.destroyAsync(dbName)
                    .then(([_response, _headers]) => {
                        expect(destroy.calledOnce)
                        expect(destroy.calledWith(dbName))
                        expect(_response).to.equal(destroyResponse)
                        expect(_headers).to.equal(headers)
                    })
        })
        it("listAsync method should pass all arguments to list method", () => {
            const list = sinon.spy(databaseScope, "list")
            return databaseScopeAsync.listAsync()
                .then(([_response, _headers]) => {
                    expect(list.calledOnce)
                    expect(_response).to.equal(listResponse)
                    expect(_headers).to.equal(headers)
                })
        })
        it("compactAsync method should pass all arguments to compact method", () => {
            const dbName = "mydb"
            const compact = sinon.spy(databaseScope, "compact")
            return databaseScopeAsync.compactAsync(dbName)
                .then(([_response, _headers]) => {
                    expect(compact.calledOnce)
                    expect(compact.calledWith(dbName))
                    expect(_response).to.equal(compactResponse)
                    expect(_headers).to.equal(headers)
                })
        })
        it("replicateAsync method should pass all arguments to replicate method", () => {
            const source = "source"
            const target = "target"
            const options = { continuous: true }
            const replicate = sinon.spy(databaseScope, "replicate")
            return databaseScopeAsync.replicateAsync(source, target, options)
                .then(([_response, _headers]) => {
                    expect(replicate.calledOnce)
                    expect(replicate.calledWith(source, target, options))
                    expect(_response).to.equal(replicateResponse)
                    expect(_headers).to.equal(headers)
                })
        })
        it("changesAsync method should pass all arguments to changes method", () => {
            const name = "name"
            const changes = sinon.spy(databaseScope, "changes")
            return databaseScopeAsync.changesAsync(name)
                .then(([_response, _headers]) => {
                    expect(changes.calledOnce)
                    expect(changes.calledWith(name))
                    expect(_response).to.equal(changesResponse)
                    expect(_headers).to.equal(headers)
                })
        })
        it("updatesAsync method should pass all arguments to updates method", () => {
            const name = "name"
            const updates = sinon.spy(databaseScope, "updates")
            return databaseScopeAsync.changesAsync(name)
                .then(([_response, _headers]) => {
                    expect(updates.calledOnce)
                    expect(updates.calledWith(name))
                    expect(_response).to.equal(changesResponse)
                    expect(_headers).to.equal(headers)
                })
        })
    })
})

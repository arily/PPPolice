import * as Nano from "nano";
import {DatabaseScopeAsync} from "./contracts/DatabaseScopeAsync";
import {DocumentScopeAsync} from "./contracts/DocumentScopeAsync";
import {ServerScopeAsync} from "./contracts/ServerScopeAsync";
import {isServerScope} from "./isServerScope";
import {promisify} from "./promisify";

export class Wrapper {
    public static wrapServerScope(serverScope: Nano.ServerScope): ServerScopeAsync {
        const serverScopeAsync: ServerScopeAsync = serverScope as any;

        const {use, scope} = serverScope;

        serverScopeAsync.db = Wrapper.wrapDatabaseScope(serverScopeAsync.db);
        serverScopeAsync.use = (db: string) => Wrapper.wrapDocumentScope(use(db));
        serverScopeAsync.scope = (db: string) => Wrapper.wrapDocumentScope(scope(db));

        serverScopeAsync.authAsync = promisify(serverScopeAsync.auth);
        serverScopeAsync.sessionAsync = promisify(serverScopeAsync.session);
        serverScopeAsync.updatesAsync = promisify(serverScopeAsync.updates);
        serverScopeAsync.uuidsAsync = promisify(serverScopeAsync.uuids);

        return serverScopeAsync;
    }

    public static wrapDatabaseScope(databaseScope: Nano.DatabaseScope): DatabaseScopeAsync {
        const databaseScopeAsync: DatabaseScopeAsync = databaseScope as any;

        const {use} = databaseScope;

        databaseScopeAsync.use = (db: string) => Wrapper.wrapDocumentScope(use(db));

        databaseScopeAsync.createAsync = promisify(databaseScopeAsync.create);
        databaseScopeAsync.getAsync = promisify(databaseScopeAsync.get);
        databaseScopeAsync.destroyAsync = promisify(databaseScopeAsync.destroy);
        databaseScopeAsync.listAsync = promisify(databaseScopeAsync.list);
        databaseScopeAsync.compactAsync = promisify(databaseScopeAsync.compact);
        databaseScopeAsync.replicateAsync = promisify(databaseScopeAsync.replicate);
        databaseScopeAsync.changesAsync = promisify(databaseScopeAsync.changes);
        databaseScopeAsync.updatesAsync = promisify(databaseScopeAsync.updates);

        return databaseScopeAsync;
    }

    public static wrapDocumentScope<D>(documentScope: Nano.DocumentScope<D>): DocumentScopeAsync<D> {
        const documentScopeAsync: DocumentScopeAsync<D> = documentScope as any;

        documentScopeAsync.infoAsync = promisify(documentScopeAsync.info);
        documentScopeAsync.replicateAsync = promisify(documentScopeAsync.replicate);
        documentScopeAsync.compactAsync = promisify(documentScopeAsync.compact);
        documentScopeAsync.changesAsync = promisify(documentScopeAsync.changes);
        documentScopeAsync.authAsync = promisify(documentScopeAsync.auth);
        documentScopeAsync.sessionAsync = promisify(documentScopeAsync.session);
        documentScopeAsync.insertAsync = promisify(documentScopeAsync.insert);
        documentScopeAsync.getAsync = promisify(documentScopeAsync.get);
        documentScopeAsync.headAsync = promisify(documentScopeAsync.head);
        documentScopeAsync.copyAsync = promisify(documentScopeAsync.copy);
        documentScopeAsync.destroyAsync = promisify(documentScopeAsync.destroy);
        documentScopeAsync.bulkAsync = promisify(documentScopeAsync.bulk);
        documentScopeAsync.listAsync = promisify(documentScopeAsync.list);
        documentScopeAsync.fetchAsync = promisify(documentScopeAsync.fetch);
        documentScopeAsync.fetchRevsAsync = promisify(documentScopeAsync.fetchRevs);
        documentScopeAsync.showAsync = promisify(documentScopeAsync.show);
        documentScopeAsync.atomicAsync = promisify(documentScopeAsync.atomic);
        documentScopeAsync.updateWithHandlerAsync = promisify(documentScopeAsync.updateWithHandler);
        documentScopeAsync.searchAsync = promisify(documentScopeAsync.search);
        documentScopeAsync.spatialAsync = promisify(documentScopeAsync.spatial);
        documentScopeAsync.viewAsync = promisify(documentScopeAsync.view);
        documentScopeAsync.viewWithListAsync = promisify(documentScopeAsync.viewWithList);

        documentScopeAsync.multipart.insertAsync = promisify(documentScopeAsync.multipart.insert);
        documentScopeAsync.multipart.getAsync = promisify(documentScopeAsync.multipart.get);

        documentScopeAsync.attachment.insertAsync = promisify(documentScopeAsync.attachment.insert);
        documentScopeAsync.attachment.getAsync = promisify(documentScopeAsync.attachment.get);
        documentScopeAsync.attachment.destroyAsync = promisify(documentScopeAsync.attachment.destroy);

        return documentScopeAsync;
    }

    public static wrap<D>(nano: Nano.ServerScope | Nano.DocumentScope<D>): ServerScopeAsync | DocumentScopeAsync<D> {
        return isServerScope(nano) ? Wrapper.wrapServerScope(nano) : Wrapper.wrapDocumentScope(nano);
    }
}

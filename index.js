const fastify = require('fastify')();
const app = require('./elm').Elm.Main.init();

const requests = new Map();
const putRequest = (ownerId, replyFn) => requests.set(ownerId, replyFn);
const popRequest = (ownerId) => {
    const replyFn = requests.get(ownerId);
    requests.delete(ownerId);
    return replyFn;
};

const buildOwnerId = () => new Date().getTime().toString();
const buildConn = (_request) => ({ ownerId: buildOwnerId() });
const parseInitConn = (conn) => JSON.stringify(conn);
const parseEndConn = (conn) => JSON.parse(conn);
const buildReply = (reply, conn) => {
    console.log(conn);
    return reply;
};

fastify.addHook('preHandler', (request, reply, done) => {
    const initConn = buildConn(request);
    putRequest(initConn.ownerId, (endConn) => {
        buildReply(reply, endConn);
        done();
    });
    app.ports.get.send(parseInitConn(initConn));
});

fastify.get('*', async (_request, _reply) => {})

const start = async () => {
    try {
        await fastify.listen({ port: 3001 });
        app.ports.put.subscribe((connStr) => {
            const endConn = parseEndConn(connStr);
            const replyFn = popRequest(endConn.ownerId);
            replyFn(endConn);
        });
    } catch (err) {
        fastify.log.error(err);
        app.ports.put.unsubscribe();
        process.exit(1);
    }
}

start().finally();

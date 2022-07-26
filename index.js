// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true });
const app = require('./elm').Elm.Main.init();

const map = new Map();
const appendReq = (id) => map.set(id.toString(), undefined);
const setReqResponse = (id, data) => map.set(id, data);
const getReq = (id) => map.get(id.toString());
const retrieveReqData = (id) => {
    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            const reqData = getReq(id);
            console.log(map);
            console.log(reqData);
            if (reqData !== undefined) {
                clearInterval(intervalId);
                resolve(reqData);
            }
        }, 100);
    });
}

// Declare a route
fastify.get('*', async (request, reply) => {
    const timestamp = new Date().getTime();
    appendReq(timestamp);

    app.ports.get.send(timestamp + "_" + request.params['*']);
    const data = await retrieveReqData(timestamp)
    console.log(data);

    return { data: data };
})

// Run the server!
const start = async () => {
    try {
        await fastify.listen({ port: 3001 });
        app.ports.put.subscribe((r) => {
            [timestamp, data] = r.split('_');
            setReqResponse(timestamp.toString(), data);
        });
    } catch (err) {
        fastify.log.error(err)
        app.ports.put.unsubscribe();
        process.exit(1)
    }
}
start()

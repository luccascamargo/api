import Fastify from "fastify";

const app = Fastify({
  logger: true
}) 

app.listen({port: 8080}, (err) => {
  if(err) {
    app.log.error(err);
  }
})
import Fastify from "fastify";

const app = Fastify({
  logger: true,
});

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running");
});

app.get("/", () => {
  return "hello world";
});

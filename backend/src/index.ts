import {Elysia} from "elysia";
import {cors} from "@elysiajs/cors";
import {createRoomRoute} from "./endpoints/createRoom.route";
import {hostWsRoute} from "./endpoints/host.ws";
import {playerWsRoute} from "./endpoints/player.ws";

const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    }),
  )
  .get("/", () => "Hello Elysia")
  .use(createRoomRoute)
  .use(hostWsRoute)
  .use(playerWsRoute)

export type App = typeof app;

const port = Number(process.env.PORT ?? 3001);
app.listen(port);

console.log(`Backend listening on http://localhost:${port}`);

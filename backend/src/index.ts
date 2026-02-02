import {Elysia} from "elysia";
import {cors} from "@elysiajs/cors";
import {createRoomRoute} from "./endpoints/createRoom.route";
import {hostWsRoute} from "./endpoints/host.ws";
import {playerWsRoute} from "./endpoints/player.ws";

const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://192.168.178.61:3000",
  "http://172.16.30.239",
  "http://172.16.30.239:3000",
  "https://luchadores-web.vercel.app",
];
const envOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const app = new Elysia()
  .use(
    cors({
      origin: [...defaultOrigins, ...envOrigins],
    }),
  )
  .get("/health", () => ({ok: true}))
  .get("/", () => "Hello Elysia")
  .use(createRoomRoute)
  .use(hostWsRoute)
  .use(playerWsRoute)

export type App = typeof app;

const port = Number(process.env.PORT ?? 3001);
app.listen(port);

console.log(`Backend listening on http://localhost:${port}`);

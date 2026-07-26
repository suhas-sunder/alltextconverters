import compression from "compression";
import express from "express";
import morgan from "morgan";

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/server.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();

app.use(compression());
app.disable("x-powered-by");

if (DEVELOPMENT) {
  console.log("Starting development server");
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    }),
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule("./server/app.ts");
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  console.log("Starting production server");
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
  app.use(morgan("tiny"));
  app.use(express.static("build/client", { maxAge: "1h" }));
  const build = await import(BUILD_PATH);
  const handleRequest = build.app ?? build.default;

  app.use(async (req, res, next) => {
    try {
      const origin = `${req.protocol}://${req.get("host") ?? "localhost"}`;
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) {
          for (const item of value) headers.append(name, item);
        } else if (value !== undefined) {
          headers.set(name, value);
        }
      }
      const request = new Request(new URL(req.originalUrl, origin), {
        method: req.method,
        headers,
      });
      /** @type {Response} */
      const response = await handleRequest(request, {});

      res.status(response.status);
      response.headers.forEach((value, name) => res.setHeader(name, value));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      next(error);
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

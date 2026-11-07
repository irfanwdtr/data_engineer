const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error("Error handling request:", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Stock Intelligence Platform Frontend ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error("Failed to prepare Next.js app:", err);
  process.exit(1);
});


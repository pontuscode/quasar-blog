import { Hono } from "hono";
import { cors } from 'hono/cors'
import { Hocuspocus } from "@hocuspocus/server";

// Node.js specific
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";

import * as Y from "yjs";

// Configure Hocuspocus
const hocuspocus = new Hocuspocus({
  async onConnect({ connection, context }) {
    console.log("in onConnect hook");
    console.log("Client connected with context: ", context);
    console.log("✅ Client user ID:", context.user?.id);
  },

  async onDisconnect({ connection, context }) {
    console.log("🔻 Client disconnected:", connection, context);
  },

  async onStoreDocument({ document }) {
    console.log("onStoreDocument hook called...");

    // Convert Yjs document to binary
    const binaryData = Y.encodeStateAsUpdate(document);

    // Save to a database or file system
    saveToDatabase(binaryData); // Replace with actual DB logic

    console.log("Document saved successfully!");
  },
});


const saveToDatabase = (binaryData) => {
  console.log(`Saving ${binaryData} to database!`);
}

// Setup Hono server
const app = new Hono();

// CORS should be called before the route
app.use('*', cors())

// Node.js specific
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// We mount HocusPocus in the Hono server
app.get(
  "/collaboration",
  upgradeWebSocket((c) => ({
    onOpen(_evt, ws) {
      console.log("in onOpen hook.");
      hocuspocus.handleConnection(ws.raw, c.req.raw, { user: { id: "1234", name: "Jane doe" } });
    },
  }))
);

// Start server
const server = serve({
  fetch: app.fetch,
  port: 8787,
}, (info) => {
  console.log(`Hono server running on port ${info.port}`);
  hocuspocus.hooks('onListen', {
    instance: hocuspocus,
    configuration: hocuspocus.configuration,
    port: info.port
  })
});

// Setup WebSocket support (Node.js specific)
injectWebSocket(server);

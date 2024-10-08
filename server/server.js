import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import path from "path";
import { fileURLToPath } from "url";
import { authMiddleware } from "./utils/auth.js";
import { typeDefs, resolvers } from "./schemas/index.js";
import db from "./config/connection.js";
import { graphqlUploadExpress } from "graphql-upload-minimal";
import stripe from "./utils/stripe.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  uploads: false,
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.use(
    "/images",
    express.static(path.join(__dirname, "../client/dist/images"))
  );

  app.use(graphqlUploadExpress());

  app.post("/api/get-checkout-session", async (req, res) => {
    const { sessionId } = req.body;

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      res.json(session);
    } catch (error) {
      console.error("Error retrieving Stripe session:", error);
      res.status(500).send({ error: "Failed to retrieve session" });
    }
  });

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: authMiddleware,
    })
  );

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });

  try {
    await db();
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
};

startApolloServer();

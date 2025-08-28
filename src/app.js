import express, { urlencoded } from "express";
import cors from "cors";

const app = express();

app.use(express.json({ limit: "16kb" })); // it accepts the json data

app.use(urlencoded({ extended: true, limit: "16kb" })); //to d=encode the url data

app.use(express.static("public")); // to show images publically from public folder

//cors configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "PUT", "POST", "PATCH", "OPTIONS", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

//routes
import healthCheckRouter from "./routes/healthCheck.route.js";
app.use("/api/v1/healthcheck", healthCheckRouter);

app.get("/", (req, res) => {
  res.send("hello welcome tomy page");
});

export default app;

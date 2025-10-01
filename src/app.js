import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json({ limit: "16kb" })); // it accepts the json data

app.use(urlencoded({ extended: true, limit: "16kb" })); //to d=encode the url data

app.use(express.static("public")); // to show images publically from public folder

app.use(cookieParser());

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
import authRouter from "./routes/auth.route.js";
import projectRouter from "./routes/project.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/project", projectRouter);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("hello welcome to my page");
});

export default app;

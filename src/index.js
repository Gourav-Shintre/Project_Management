import dotenv from "dotenv";
import app from "./app.js";
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8080;


app.listen(port, () => {
  console.log(`application is running on port ${port}`);
});

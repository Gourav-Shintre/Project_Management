import express, { urlencoded } from "express";

const app = express();

app.use(express.json({ limit: "16kb" })); // it accepts the json data   

app.use(urlencoded({ extended: true , limit: "16kb" }));  //to d=encode the url data

app.use(express.static("public")) // to show images publically from public folder

app.get("/", (req, res) => {
  res.send("hello welcome tomy page");
});

export default app;

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { readdirSync } = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// const userRoutes = require("./routes/user");

// readdirSync read whatever is in the file, in this case it reads the
// routes file and takes the route one at a time and then imports them
// one by one. readdirSync returns an array of the contents of file
readdirSync("./routes").map((route) =>
  app.use("/", require("./routes/" + route))
);

// database
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
  })
  .then(() => console.log("database connected successfully"))
  .catch((err) => console.log("error connecting to mongodb", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("server is listening");
});

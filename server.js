require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { createUser, getAllUsers } = require("./controllers/users");
const {
  getAllNotesByUser,
  getIndividualNoteByUser,
  createNote,
  deleteNoteByUser,
  updateNoteByUser,
} = require("./controllers/notes");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ msg: "Hello from the Notes App - This is the demo" });
});

app.post("/users", createUser);

app.get("/users", getAllUsers);

app.get("/:user/notes", getAllNotesByUser);

app.get("/:user/notes/:id", getIndividualNoteByUser);

app.post("/:user/notes", createNote);

app.delete("/:user/notes/:id", deleteNoteByUser);

app.patch("/:user/notes/:id", updateNoteByUser);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

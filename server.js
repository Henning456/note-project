require("dotenv").config();
const express = require("express");
const { sql } = require("@vercel/postgres");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ msg: "Hello from the Notes App - This is the demo" });
});

/* DONE ✅
  - [x] create a new user
*/
app.post("/users", async (req, res) => {
  const { name } = req.body;
  const { rowCount } = await sql`INSERT INTO users (name) VALUES (${name})`;

  if (rowCount) {
    res.json({ message: `User with name ${name} was successfully created.` });
  } else {
    res.json({ message: `User with name ${name} COULD NOT be created.` });
  }
});

/* DONE ✅
  - [x] list all users
*/
app.get("/users", async (req, res) => {
  const { rows } = await sql`SELECT * FROM users`;
  res.json(rows);
});

/* TODO ✅
  - [x] change route to something like "/:user/notes"
  - [x] check if user exists
  - [x] return all notes by that user
*/
app.get("/:user/notes", async (req, res) => {
  const { user } = req.params;
  /* query to get user information */
  const { rows: rowsUser } =
    await sql`SELECT * FROM users WHERE name = ${user}`;

  /* if the user does not exist, respond with an error message */
  if (!rowsUser.length) {
    return req.json({ message: `Could NOT find the ${user}.` });
  }

  /* query to get all notes */
  const { rows } = await sql`SELECT * FROM notes 
                             INNER JOIN users ON notes."userId" = users.id
                             WHERE name = ${user}`;

  res.json(rows);
});

/* TODO ✅
  - [x] change route to something like "/:user/notes/:id"
  - [x] check if user exists
  - [x] return the individual note by that user
*/
app.get("/:user/notes/:id", async (req, res) => {
  const { user, id } = req.params;

  const { rows: rowsUser } =
    await sql`SELECT * FROM users WHERE name = ${user}`;

  /* if the user DOES NOT EXIST respond with a message and return from the function */
  if (!rowsUser.length) {
    return res.json({ message: `Could NOT find the user ${user}.` });
  }

  const { rows } = await sql`SELECT * FROM notes 
                             INNER JOIN users ON notes."userId" = users.id
                             WHERE notes.id = ${id}
                             AND users.id = ${rowsUser[0].id}`;

  if (!rows.length) {
    return res.json({ message: `Could NOT find the note with id ${id}.` });
  }

  res.json(rows);
});

/* DONE ✅
  - [x] change route to something like "/:user/notes"
  - [x] check if user exists
  - [x] return success/failure message
*/
app.post("/:user/notes", async (req, res) => {
  const { user } = req.params;
  const { content, category } = req.body;

  if (!content || !category) {
    return res.json({
      message:
        "Could NOT add note because content and category were not provided.",
    });
  }

  const { rows } = await sql`SELECT * FROM users WHERE name = ${user}`;

  /* if the user DOES NOT EXIST respond with a message and return from the function */
  if (!rows.length) {
    return res.json({ message: `Could NOT find the user ${user}.` });
  }

  const { rowCount } =
    await sql`INSERT INTO notes (CONTENT, CATEGORY, "userId") VALUES (${content},${category},${rows[0].id})`;

  if (rowCount) {
    res.json({
      message: `A new note with content = ${content} and category = ${category} was added.`,
    });
  } else {
    res.json({
      message: `Note could NOT be created.`,
    });
  }
});

/* TODO 🕜
  - change route to something like "/:user/notes/:id"
  - check if user exists
  - delete the individual note by that user
  - return a success/failure message
*/
app.delete("/:user/notes/:id", async (req, res) => {
  const { user, id } = req.params;

  const { rows: rowsUser } =
    await sql`SELECT * FROM users WHERE name = ${user}`;

  const { rowCount } = await sql`DELETE FROM notes where id = ${id}`;

  res.json({ msg: `Element with id=${id} successfully deleted` });
});

/* TODO 🕜
  - change route to something like "/:user/notes/:id"
  - check if user exists
  - update the individual note by that user
  - return a success/failure message
*/
app.patch("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { content, category } = req.body;

  const { rowCount } =
    await sql`UPDATE notes SET content = ${content},category = ${category} WHERE id = ${id}`;

  res.json({ msg: `Element with id=${id} successfully updated` });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

const { sql } = require("@vercel/postgres");

const getAllNotesByUser = async (req, res) => {
  const { user } = req.params;

  try {
    const { rows, rowCount } = await sql`
          SELECT notes.id, notes.content, notes.category, notes."createdAt", notes."userId" FROM notes
          JOIN users ON notes."userId" = users.id
          WHERE UPPER(users.name) = UPPER(${user})
        `;

    if (rowCount > 0) {
      res.send(rows);
    } else {
      res.send({ message: "Notes could NOT be found." });
    }
  } catch (error) {
    res.send({ message: `Something went wrong. ${error}` });
  }
};

const getIndividualNoteByUser = async (req, res) => {
  const { user, id } = req.params;

  try {
    const { rows: rowsUser } =
      await sql`SELECT * FROM users WHERE UPPER(name) = UPPER(${user})`;

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

    res.json(rows[0]);
  } catch (error) {
    return res.json({ message: "An error occurred." });
  }
};

const createNote = async (req, res) => {
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
};

const deleteNoteByUser = async (req, res) => {
  const { user, id } = req.params;

  try {
    const { rowCount } = await sql`
          DELETE FROM notes
          WHERE id = ${id} AND "userId" = (
            SELECT id FROM users WHERE UPPER(name) = UPPER(${user})
          )
        `;

    if (rowCount > 0) {
      res.json({ message: `Note with ID ${id} successfully deleted.` });
    } else {
      res.json({ message: `Note with ID ${id} not found.` });
    }
  } catch (error) {
    res.json({ message: `Something went wrong. ${error}` });
  }
};

const updateNoteByUser = async (req, res) => {
  const { user, id } = req.params;
  const { content, category } = req.body;

  try {
    const { rowCount } = await sql`
          UPDATE notes
          SET content = ${content}, category = ${category}
          WHERE id = ${id} AND "userId" = (
            SELECT id FROM users WHERE UPPER(users.name) = UPPER(${user})
          )
        `;

    if (rowCount > 0) {
      res.send({
        message: `Note with ID ${id} updated successfully for user ${user}.`,
      });
    } else {
      res.send({
        message: `Note with ID ${id} not found or does not belong to user ${user}.`,
      });
    }
  } catch (error) {
    res.send({ message: `Something went wrong. ${error}` });
  }
};

module.exports = {
  getAllNotesByUser,
  getIndividualNoteByUser,
  createNote,
  deleteNoteByUser,
  updateNoteByUser,
};

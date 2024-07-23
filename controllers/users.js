const { sql } = require("@vercel/postgres");

const createUser = async (req, res) => {
  const { name } = req.body;
  const { rowCount } = await sql`INSERT INTO users (name) VALUES (${name})`;

  if (rowCount) {
    res.json({ message: `User with name ${name} was successfully created.` });
  } else {
    res.json({ message: `User with name ${name} COULD NOT be created.` });
  }
};

const getAllUsers = async (req, res) => {
  const { rows } = await sql`SELECT * FROM users`;
  res.json(rows);
};

module.exports = { createUser, getAllUsers };

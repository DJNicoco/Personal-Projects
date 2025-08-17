// index.js — Book Notes (Express 5 + EJS + PostgreSQL + Open Library)
// Run: npm install && npm start

const express = require("express");
const path = require("path");
const axios = require("axios");
const methodOverride = require("method-override");
const dotenv = require("dotenv");
const db = require("./db");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// View engine + static + parsers
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); // allow ?_method=PUT|DELETE from forms

// ---------- Helpers ----------
const coverUrlFromISBN = (isbn, size = "M") =>
  isbn ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-${size}.jpg` : null;

const sortClause = (sort) => {
  switch (sort) {
    case "title":
      return "ORDER BY title ASC, created_at DESC";
    case "rating":
      return "ORDER BY rating DESC NULLS LAST, created_at DESC";
    case "recency":
    default:
      return "ORDER BY created_at DESC";
  }
};

// ---------- Routes ----------

// Home: list + sort
app.get("/", async (req, res) => {
  const sort = req.query.sort || "recency";
  try {
    const { rows } = await db.query(
      `SELECT id, title, author, isbn, rating, notes, date_read, created_at, updated_at
         FROM books ${sortClause(sort)};`
    );
    res.render("index", { books: rows, sort, error: null });
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).render("index", { books: [], sort, error: "Failed to load books." });
  }
});

// New form
app.get("/books/new", (req, res) => {
  res.render("new", { error: null, values: {} });
});

// Create
app.post("/books", async (req, res) => {
  const { title, author, isbn, rating, notes, date_read } = req.body;
  if (!title) return res.status(400).render("new", { error: "Title is required.", values: req.body });

  try {
    await db.query(
      `INSERT INTO books (title, author, isbn, rating, notes, date_read)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [title.trim(), author || null, isbn || null, rating ? Number(rating) : null, notes || null, date_read || null]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error creating book:", err);
    res.status(500).render("new", { error: "Failed to save book.", values: req.body });
  }
});

// Show one
app.get("/books/:id", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM books WHERE id=$1;", [req.params.id]);
    if (rows.length === 0) return res.status(404).render("notfound", { id: req.params.id });
    res.render("show", { book: rows[0] });
  } catch (err) {
    console.error("Error fetching book:", err);
    res.status(500).render("notfound", { id: req.params.id });
  }
});

// Edit form
app.get("/books/:id/edit", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM books WHERE id=$1;", [req.params.id]);
    if (!rows.length) return res.status(404).render("notfound", { id: req.params.id });
    res.render("edit", { book: rows[0], error: null });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).render("notfound", { id: req.params.id });
  }
});

// Update
app.put("/books/:id", async (req, res) => {
  const { title, author, isbn, rating, notes, date_read } = req.body;
  if (!title) {
    const { rows } = await db.query("SELECT * FROM books WHERE id=$1;", [req.params.id]);
    return res.status(400).render("edit", { book: rows[0], error: "Title is required." });
  }

  try {
    await db.query(
      `UPDATE books
         SET title=$1, author=$2, isbn=$3, rating=$4, notes=$5, date_read=$6, updated_at=NOW()
       WHERE id=$7;`,
      [title.trim(), author || null, isbn || null, rating ? Number(rating) : null, notes || null, date_read || null, req.params.id]
    );
    res.redirect(`/books/${req.params.id}`);
  } catch (err) {
    console.error("Error updating book:", err);
    const { rows } = await db.query("SELECT * FROM books WHERE id=$1;", [req.params.id]);
    res.status(500).render("edit", { book: rows[0], error: "Failed to update book." });
  }
});

// Delete
app.delete("/books/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM books WHERE id=$1;", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).redirect("/?error=delete");
  }
});

// ---------- API helpers (Axios + Open Library) ----------

// 1) Verify cover for ISBN (HEAD check)
app.get("/api/cover", async (req, res) => {
  const isbn = (req.query.isbn || "").trim();
  if (!isbn) return res.status(400).json({ error: "Provide ?isbn=" });
  const url = coverUrlFromISBN(isbn, "M");
  try {
    await axios.head(url);
    res.json({ isbn, cover: url, exists: true });
  } catch {
    res.json({ isbn, cover: null, exists: false });
  }
});

// 2) Search Open Library by title
app.get("/api/search", async (req, res) => {
  const title = (req.query.title || "").trim();
  if (!title) return res.status(400).json({ error: "Provide ?title=" });
  try {
    const { data } = await axios.get("https://openlibrary.org/search.json", { params: { title, limit: 5 } });
    const results = (data.docs || []).slice(0, 5).map((doc) => ({
      title: doc.title,
      author: (doc.author_name && doc.author_name[0]) || null,
      first_publish_year: doc.first_publish_year || null,
      isbn: (doc.isbn && doc.isbn[0]) || null,
      cover: doc.isbn && doc.isbn[0] ? coverUrlFromISBN(doc.isbn[0], "M") : null
    }));
    res.json({ query: title, results });
  } catch (err) {
    console.error("Open Library search failed:", err?.response?.status || err.message);
    res.status(502).json({ error: "Failed to fetch from Open Library" });
  }
});

// 404
app.use((req, res) => res.status(404).render("notfound", { id: null }));

app.listen(PORT, () => console.log(`📚 Book Notes running at http://localhost:${PORT}`));

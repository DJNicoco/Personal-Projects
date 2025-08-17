// index.js — Blog Web Application (in-memory CRUD)
// Run: npm start  (or node index.js)

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ----- View engine & middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); // parse form posts

// ----- In-memory data (resets on server restart)
let posts = [];
let nextId = 1;
const find = (id) => posts.find((p) => p.id === id);

// ----- Routes

// Home: create form + list posts
app.get("/", (req, res) => {
  const sorted = [...posts].sort((a, b) => b.updatedAt - a.updatedAt);
  res.render("index", { pageTitle: "My Blog", posts: sorted, error: undefined });
});

// Create a post
app.post("/posts", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    const sorted = [...posts].sort((a, b) => b.updatedAt - a.updatedAt);
    return res.status(400).render("index", {
      pageTitle: "My Blog",
      posts: sorted,
      error: "Title and content are required."
    });
  }

  const now = new Date();
  const post = {
    id: String(nextId++),
    title: title.trim(),
    content: content.trim(),
    createdAt: now,
    updatedAt: now
  };
  posts.push(post);
  res.redirect(`/posts/${post.id}`);
});

// View a single post
app.get("/posts/:id", (req, res) => {
  const post = find(req.params.id);
  if (!post) return res.status(404).render("notfound", { pageTitle: "Not Found", id: req.params.id });
  res.render("show", { pageTitle: post.title, post });
});

// Edit form
app.get("/posts/:id/edit", (req, res) => {
  const post = find(req.params.id);
  if (!post) return res.status(404).render("notfound", { pageTitle: "Not Found", id: req.params.id });
  res.render("edit", { pageTitle: `Edit: ${post.title}`, post, error: undefined });
});

// Save edit
app.post("/posts/:id/edit", (req, res) => {
  const post = find(req.params.id);
  if (!post) return res.status(404).render("notfound", { pageTitle: "Not Found", id: req.params.id });

  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).render("edit", { pageTitle: `Edit: ${post.title}`, post, error: "Title and content are required." });
  }

  post.title = title.trim();
  post.content = content.trim();
  post.updatedAt = new Date();
  res.redirect(`/posts/${post.id}`);
});

// Delete
app.post("/posts/:id/delete", (req, res) => {
  posts = posts.filter((p) => p.id !== req.params.id);
  res.redirect("/");
});

// 404 fallback
app.use((req, res) => res.status(404).render("notfound", { pageTitle: "Not Found", id: null }));

app.listen(PORT, () => console.log(`✅ Listening on http://localhost:${PORT}`));

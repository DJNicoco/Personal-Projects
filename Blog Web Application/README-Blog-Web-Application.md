# 📰 Blog Web Application – In‑Memory CRUD

**Built with Node.js (Express) and EJS**  
**Personal Project** | Aug 2025

---

## 📌 Project Overview

A simple blog where users can create, view, edit, and delete posts. This version intentionally uses **in‑memory storage** (no database), so posts **reset when the server restarts**. The UI is server‑rendered with EJS templates and a small CSS file for basic styling.

---

## 🚀 Key Features

- ✅ **CRUD** – Create, read, update, and delete blog posts  
- ✅ **Server‑side rendering** – EJS templates for pages and forms  
- ✅ **In‑memory storage** – No database; great for learning/testing  
- ✅ **Minimal stack** – Fast to set up and run

---

## 🔧 Tech Stack

- **Backend:** Node.js, Express  
- **Templating:** EJS  
- **Styles:** CSS 
- **Persistence:** In‑memory (arrays) — resets on server restart

---

## 🧭 App Routes 

| Method | Route                | Description                |
|------: |----------------------|----------------------------|
| GET    | `/`                  | Home – form + list posts   |
| POST   | `/posts`             | Create a post              |
| GET    | `/posts/:id`         | View a single post         |
| GET    | `/posts/:id/edit`    | Edit form                  |
| POST   | `/posts/:id/edit`    | Save edits to a post       |
| POST   | `/posts/:id/delete`  | Delete a post              |

---

## 🖥️ App Preview – Blog Web App 

### Home
![Home](<Home Page.png>)

### View Post
![Add](<Adding Post.png>)

### Edit Post
![Edit](<Edit Post.png>)

### Changed Title
![alt text](<Changed Title of Post.png>)

---

## 💬 Reflection

This project was a focused exercise in Express routing and EJS templating. Keeping storage in memory made it fast to iterate on CRUD flows and page rendering without database overhead.
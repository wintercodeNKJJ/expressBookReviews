const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// axios is used below for demonstration of asynchronous requests
// make sure to install it: npm install axios
const axios = require('axios');


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully", user:username });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // return full list of books
  return res.status(200).json(books);
});

// --- examples showing how a client might fetch the same list with axios ---


// async/await
public_users.get('/books-async', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
 });

// async/await
public_users.get('/isbn-async/:isbn', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/isbn/:isbn');
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  let results = {};
  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author) {
      results[isbn] = books[isbn];
    }
  }
  if (Object.keys(results).length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({ message: "No books found for that author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  let results = {};
  for (let isbn in books) {
    if (books[isbn].title.toLowerCase() === title) {
      results[isbn] = books[isbn];
    }
  }
  if (Object.keys(results).length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({ message: "No books found with that title" });
  }
});

// async/await
public_users.get('/title-async/:title', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/title/:title');
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json({ reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;

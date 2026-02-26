const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


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

// helper functions that return promises
function getBooks() {
  return new Promise((resolve) => {
    resolve(books);
  });
}

function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error("Book not found"));
    }
  });
}

function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const key = author.toLowerCase();
    let results = {};
    for (let isbn in books) {
      if (books[isbn].author.toLowerCase() === key) {
        results[isbn] = books[isbn];
      }
    }
    if (Object.keys(results).length > 0) {
      resolve(results);
    } else {
      reject(new Error("No books found for that author"));
    }
  });
}

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const key = title.toLowerCase();
    let results = {};
    for (let isbn in books) {
      if (books[isbn].title.toLowerCase() === key) {
        results[isbn] = books[isbn];
      }
    }
    if (Object.keys(results).length > 0) {
      resolve(results);
    } else {
      reject(new Error("No books found with that title"));
    }
  });
}

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBooks()
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json({ message: err.message }));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  getBookByISBN(isbn)
    .then(book => res.status(200).json(book))
    .catch(() => res.status(404).json({ message: "Book not found" }));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  getBooksByAuthor(author)
    .then(results => res.status(200).json(results))
    .catch(() => res.status(404).json({ message: "No books found for that author" }));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  getBooksByTitle(title)
    .then(results => res.status(200).json(results))
    .catch(() => res.status(404).json({ message: "No books found with that title" }));
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

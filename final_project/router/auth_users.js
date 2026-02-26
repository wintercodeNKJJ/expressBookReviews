const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // a valid username is a non-empty string that isn't already registered
    if (!username || typeof username !== 'string') {
        return false;
    }
    return !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    if (!username || !password) return false;
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (authenticatedUser(username, password)) {
    // create JWT and save into session (middleware in index.js will also execute for /auth/* routes)
    let accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 });
    req.session.authorization = {
      accessToken,
      username
    };
    return res.status(200).send({message:"User successfully logged in"});
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session?.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }
  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  // add or update the review for this user
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated", reviews: books[isbn].reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session?.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }
  if (!isbn) {
    return res.status(400).json({ message: "ISBN is required" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }
  
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

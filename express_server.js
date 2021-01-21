// require libs and middleware
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
let cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

// require helper functions
const {getUserByEmail} = require('./helpers');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'hawaiian', 'pizza', 'donuts']
}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "spongebob" }
};

// example testing userDb don't have actual hashed pass
const users = {
  "spongebob": {
    id: "spongebob",
    email: "pineapple@underthesea.com",
    hashedPassword: "yellow"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "snacks@latenight.com",
    hashedPassword: "cookies"
  }

};

// Section of helper functions

// generates string for tiny URLS and maybe user ids
const generateRandomString = function() {
  const result = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
  const numChars = 6 + 1;
  for (let i = 0; i < numChars; i++) {
    let c = Math.floor(Math.random() * 61);
    result.push(chars[c]);
  }
  return result.join('');
};

// checks if the the email already exists
const notValidReg = function(newMail, pass) {
  if (!newMail || !pass) {
    return true;
  }
  
  console.log(`getUserBy email is returning ${getUserByEmail(newMail, users)}`);
  if (getUserByEmail(newMail, users)) {
    console.log("user exists");
    return true;
  }
  console.log("returning true");
  return false;
};

// checks for user authentication
const getUser = function(mail, pass) {
  if (!mail || !pass) {
    return false;
  }
  for (const user in users) {
    if (users[user].email === mail) {
      if (bcrypt.compareSync(pass, users[user].hashedPassword)) {
        return users[user].id;
      }
    }
  }
  console.log("not valid user");
  return false;
};

// returns URL objects that belong to the user id
const urlsForUser = function(id) {
  const results = {};
  for (const entry in urlDatabase) {
    if (urlDatabase[entry].userID === id) {
      results[entry] = urlDatabase[entry];
    }
  }
  return results;
};

// checks if the a URL object belongs to the current user
const isOwnURL = function(cookieID, urlID) {
  if (!cookieID || !urlID) {
    return false;
  } else if (urlDatabase[urlID].userID === cookieID) {
    return true;
  }
};

const isURLDb = function(shortURL) {
  if (!shortURL) {
    return false;
  }
  for (const entry in urlDatabase) {
    if (entry === shortURL) {
      return true;
    }
  }
  return false;
};





// route for Home page
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/urls/login');
  }
  res.redirect('/urls');
});

// route for list of urls (belonging to specific user)
app.get("/urls", (req, res) => {
  let error = null;
  //If not logged in display message to log in or register
  if (!req.session.user_id) {
    error = "Please login";
  }
  let selectUrls = urlsForUser(req.session.user_id);
  const templateVars = {urls: selectUrls, "user": users[req.session.user_id], error};
  res.render("urls_index", templateVars);
});


// route to page that can create new tiny URLS
app.get("/urls/new", (req, res) =>{
  let error = null;
  if (!req.session.user_id) {
    error = "Please login";
  }
  if (req.session.user_id) {
    const templateVars = {"user": users[req.session.user_id], error};
    res.render("urls_new", templateVars);
    return;
  }

  res.redirect('/urls/login');
});

// route that generates new tiny URLS
app.post("/urls", (req, res) => {
  const newStr = generateRandomString();
  let newUrlObj = {longURL: req.body.longURL, userID: req.session.user_id};
  urlDatabase[newStr] = newUrlObj;
  res.redirect(`/urls/${newStr}`);
});

// route shows the page to register new user
let error = null;
app.get("/urls/register", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = {"user": users[req.session.user_id], error};
    res.render('urls_register', templateVars);
    return;
  }
  res.redirect('/urls');
});

// route that registers new user
app.post("/urls/register", (req, res) => {

  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);

  if (notValidReg(email, hashedPassword)) {
    error = "Cannot register this email and password";
    const templateVars = {"user": users[req.session.user_id], error};
    res.render("urls_register", templateVars);
    return;
  }
  users[id] = {id, email, hashedPassword};
  req.session.user_id = id;

  console.log(`the cookie should be ${id} and peek at users object`);
  console.log(users);
  
  res.redirect('/urls');
});

// route that shows the page to log in
app.get("/urls/login", (req, res) => {
  if (!req.session.user_id) {
    let error = null;
    const templateVars = {"user": users[req.session.user_id], error};
    res.render("urls_login", templateVars);
    return;
  }
  res.redirect('/urls');
});

// route that checks and processes the login and sets cookie
app.post("/urls/login", (req, res) => {
  console.log(` peek at users object`);
  console.log(users);
  let error = null;
  let email = req.body.email;
  let pass = req.body.password;
  let isUser = getUser(email, pass);
  console.log(isUser);
  if (isUser) {
    // set session cookie and redirect
    req.session.user_id = isUser;
    res.redirect('/urls');
    return;
  } else {
    error = "Incorrect credentials";
    const templateVars = {"user": users[req.session.user_id], error};
    res.render("urls_login", templateVars);
  
  }

});

// route that redirects using the short url to the long url
app.get("/u/:shortURL", (req, res) => {
  if (isURLDb(req.params.shortURL)) {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
    return;
  } else {
    let error = "Short URL doesn't exist";
    const templateVars = {"user": users[req.session.user_id], error};
    res.render('urls_index', templateVars);
  }
});

// route to edit URLS page/ shows the details of one URL
app.get("/urls/:shortURL", (req, res) => {
  let error = null;
  let shortURL = req.params.shortURL;
  let longURL = '';
  if (!req.session.user_id) {
    error = "Please login";
  } else if (!isURLDb(shortURL)) {   //case there is no such short URL
    error = "Invalid short URL";
  } else if (!isOwnURL(req.session.user_id, req.params.shortURL)) {   // case the short URL belongs to another user
    error = "This URL has a different owner";
  } else {
    longURL = urlDatabase[req.params.shortURL].longURL;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: longURL,
    "user": users[req.session.user_id],
    error
  };
  res.render("urls_show", templateVars);
});


// route to process the edit urls (only the specific user can edit)
app.post("/urls/:shortURL", (req, res) => {
  //if the cookie matches the userID
  console.log(`Is it getting the short URL? ${req.params.shortURL}`);
  if (isOwnURL(req.session.user_id, req.params.shortURL)) {
    urlDatabase[req.params.shortURL].longURL = req.body.editURL;
  }

  res.redirect("/urls");
});

// route to remove URL entries  (only the specific user can delete)
app.post("/urls/:shortURL/delete", (req, res) => {
  let error = null;
  //if the cookie matches the userID
  if (isOwnURL(req.session.user_id, req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
  } else {
    error = "Not authorized to delete URL"
    if (!req.session.user_id){
      error = "Please login";
    }
    const templateVars = {"user": users[req.session.user_id], error};
    res.render('urls_index', templateVars);
    return;
  }
  res.redirect(`/urls/`);

});

//route to logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

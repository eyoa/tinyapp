// require libs and middleware
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

// require helper functions
const {
  getUserByEmail,
  isValidReg,
  generateRandomString,
  getDate
} = require('./helpers');


const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'hawaiian', 'pizza', 'donuts']
}));
app.use(methodOverride('_method'));


// Check Const and Let


// databases with example users and data

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID", date: '1-20-2021', visits: 0, visitors: [] },
  i3BoGr: { longURL: "https://www.google.ca", userID: "spongebob", date: '1-20-2021', visits: 0, visitors: [] }
};

// To access password for spongebob is test and user2RandomID is cookies
const users = {
  "spongebob": {
    id: "spongebob",
    email: "pineapple@underthesea.com",
    hashedPassword: "$2b$10$0xdTx/6X8LdvKNayKxA0CO3rZD2zr.6VpCtxIl2GP13bm24AZv7HG"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "snacks@latenight.com",
    hashedPassword: "$2b$10$Iq9FhNkAZD2F6tbAUDrJ5.60VJGGFL73dd6eAEidigOlcfh09sIYW"
  }

};

// Section of helper functions kept here because they require access to databases

// checks for user authentication returns user id if valid
const getUser = function(mail, pass) {
  if (!mail || !pass) {
    return false;
  }
  const user = getUserByEmail(mail, users);
  if (user) {
    if (bcrypt.compareSync(pass, user.hashedPassword)) {
      return user.id;
    }
  }
  return false;
};

// returns object of URL objects that belong to the specific user
const getOwnURLs = function(id) {
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
  return (!cookieID || !urlID) ? false
    : (urlDatabase[urlID].userID === cookieID) ? true
      : false;
};

// Checks if short url exists in database
const isTinyUrl = function(shortURL) {
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

// route for Home page if user logged in redirects to urls, if not redirects to login page
app.get("/", (req, res) => {
  if (!req.session.userId) {
    res.redirect('/urls/login');
    return;
  }
  res.redirect('/urls');
});

// route for list of urls (belonging to specific user)
app.get("/urls", (req, res) => {
  let error = null;

  //If not logged in display message to log in or register
  if (!req.session.userId) {
    error = "Please login";
  }
  const templateVars = {
    urls: getOwnURLs(req.session.userId),
    "user": users[req.session.userId],
    error
  };
  res.render("urls_index", templateVars);
});


// route to page that can create new tiny URLS
app.get("/urls/new", (req, res) =>{
  
  if (!req.session.userId) {
    res.redirect('/urls/login');
  }

  if (req.session.userId) {
    const error = null;
    const templateVars = {"user": users[req.session.userId], error};
    res.render("urls_new", templateVars);
    return;
  }
});

// route that generates new tiny URLS
app.post("/urls", (req, res) => {
  let error = null;
  const longURL = req.body.longURL.trim();
  
  if (!req.session.userId) {
    error = "Must be logged in";
    const templateVars = {"user": users[req.session.userId], error};
    res.render("urls_new", templateVars);
    return;
  }
  
  if (!longURL) {
    error = "URL cannot be blank";
    const templateVars = {"user": users[req.session.userId], error};
    res.render("urls_new", templateVars);
    return;
  }
  
  const newStr = generateRandomString();
  const date = getDate();
  const visits = 0;
  const visitors = [];
  urlDatabase[newStr] = {
    longURL,
    date,
    visits,
    visitors,
    userID: req.session.userId
  };
  res.redirect(`/urls/${newStr}`);
});

// route shows the page to register new user
app.get("/urls/register", (req, res) => {
  let error = null;
  if (!req.session.userId) {
    const templateVars = {"user": users[req.session.userId], error};
    res.render('urls_register', templateVars);
    return;
  }
  res.redirect('/urls');
});

// route that registers new user
app.post("/urls/register", (req, res) => {
  let error = null;
  const id = generateRandomString();
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  

  if (!email || !password) {
    error = "E-mail and password cannot be blank";

  } else if (isValidReg(email, hashedPassword, users)) {
    users[id] = {id, email, hashedPassword};
    req.session.userId = id;
    res.redirect('/urls');
    return;

  } else {
    error = "This E-mail already registered. Please Login";
  }

  const templateVars = {"user": users[req.session.userId], error};
  res.render("urls_register", templateVars);
});

// route that shows the page to log in
app.get("/urls/login", (req, res) => {
  if (!req.session.userId) {
    const error = null;
    const templateVars = {"user": users[req.session.userId], error};
    res.render("urls_login", templateVars);
    return;
  }
  res.redirect('/urls');
});

// route that checks and processes the login and sets cookie
app.post("/urls/login", (req, res) => {
  let error = null;
  const {email, password} = req.body;
  const isUser = getUser(email, password);

  if (isUser) {
    req.session.userId = isUser;
    res.redirect('/urls');
    return;

  } else {
    error = "Incorrect credentials";
    const templateVars = {"user": users[req.session.userId], error};
    res.render("urls_login", templateVars);
  }

});

// checkes if visitorID is unique and returns boolean value. Will add new unique visitor.
const isUniqueVisitor = function(shortURL, visitorId) {
  let visitorList = urlDatabase[shortURL].visitors;
  for (const id of visitorList) {
    if (id === visitorId) {
      return false;
    }
  }
  urlDatabase[shortURL].visitors.push(visitorId);
  return true;
};


// route that redirects using the short url to the long url
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;

  if (isTinyUrl(shortURL)) {
    // log a unique vistor id cookie for analytics
    if (!req.session.visitor) {
      req.session.visitor = generateRandomString();
    } else {
      const visitorId = req.session.visitor;
      isUniqueVisitor(shortURL, visitorId);
    }

    const longURL = urlDatabase[shortURL].longURL;
    urlDatabase[shortURL].visits += 1;
    res.redirect(longURL);
    return;
  } else {
    let error = "Short URL doesn't exist";
    const templateVars = {"user": users[req.session.userId], error};
    res.render('urls_index', templateVars);
  }
});

// route to edit URLS page and shows the details of one URL
app.get("/urls/:id", (req, res) => {
  let error = null;
  const shortURL = req.params.id;
  let longURL = '';

  if (!req.session.userId) {
    error = "Please login";

  } else if (!isTinyUrl(shortURL)) {            //case there is no such short URL
    error = "Invalid short URL";

  } else if (!isOwnURL(req.session.userId, shortURL)) {        // case the short URL belongs to another user
    error = "This URL has a different owner";

  } else {
    longURL = urlDatabase[shortURL].longURL;

  }
  const templateVars = {
    shortURL,
    longURL,
    "user": users[req.session.userId],
    date: urlDatabase[shortURL].date,
    visits: urlDatabase[shortURL].visits,
    visitors : urlDatabase[shortURL].visitors,
    error
  };
  res.render("urls_show", templateVars);
});

// route to process the edit urls (only the specific user can edit)
app.put("/urls/:id", (req, res) => {
  let error = null;
  if (!req.session.userId) {
    error = "Please Login";
  } else if (!isOwnURL(req.session.userId, req.params.id)) {
    error = "Not Authorized to edit this URL";
  } else {
    const longURL = req.body.editURL.trim();
    if (!longURL) {
      error = "Cannot update to blank URL";
    } else {
      urlDatabase[req.params.id].longURL = longURL;
      res.redirect("/urls");
      return;
    }
  }

  const templateVars = {"user": users[req.session.userId], error};
  res.render('urls_index', templateVars);

});

// route to remove URL entries  (only the specific user can delete)
app.delete("/urls/:id", (req, res) => {
  let error = null;
  if (!req.session.userId) {
    error = "Please Login";
  } else if (!isOwnURL(req.session.userId, req.params.id)) {
    error = "Not authorized to delete URL";
  } else {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls/`);
    return;
  }
  const templateVars = {"user": users[req.session.userId], error};
  res.render('urls_index', templateVars);

});

//route to logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
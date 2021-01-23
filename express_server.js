// require libs and middleware
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

// require helper functions
const {
  isValidReg,
  generateRandomString,
  getDate,
  isOwnURL,
  getUser,
  getOwnURLs,
  isTinyUrl,
  isUniqueVisitor
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


// databases with example users and data

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID", date: '1-20-2021', visits: 0, visitors: [], timestamps: [] },
  i3BoGr: { longURL: "https://www.google.ca", userID: "spongebob", date: '1-20-2021', visits: 0, visitors: [], timestamps: [] }
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

// route for Home page if user logged in redirects to urls, if not redirects to login page
app.get("/", (req, res) => {
  if (!req.session.userId) {
    res.redirect('/login');
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
    urls: getOwnURLs(req.session.userId, urlDatabase),
    "user": users[req.session.userId],
    error
  };
  res.render("urls_index", templateVars);
});


// route to page that can create new tiny URLS
app.get("/urls/new", (req, res) =>{
  
  if (!req.session.userId) {
    res.redirect('/login');
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
  const timestamps = [];
  urlDatabase[newStr] = {
    longURL,
    date,
    visits,
    visitors,
    timestamps,
    userID: req.session.userId
  };
  res.redirect(`/urls/${newStr}`);
});

// route shows the page to register new user
app.get("/register", (req, res) => {
  let error = null;
  if (!req.session.userId) {
    const templateVars = {"user": users[req.session.userId], error};
    res.render('urls_register', templateVars);
    return;
  }
  res.redirect('/urls');
});

// route that registers new user
app.post("/register", (req, res) => {
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
app.get("/login", (req, res) => {
  if (!req.session.userId) {
    const error = null;
    const templateVars = {"user": users[req.session.userId], error};
    res.render("urls_login", templateVars);
    return;
  }
  res.redirect('/urls');
});

// route that checks and processes the login and sets cookie
app.post("/login", (req, res) => {
  let error = null;
  const {email, password} = req.body;
  const isUser = getUser(email, password, users);

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

// route that redirects using the short url to the long url
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;

  if (isTinyUrl(shortURL, urlDatabase)) {
    // log a unique vistor id cookie for analytics
    if (!req.session.visitor) {
      req.session.visitor = generateRandomString();
    } else {
      const visitorId = req.session.visitor;
      isUniqueVisitor(shortURL, visitorId, urlDatabase);
    }

    const longURL = urlDatabase[shortURL].longURL;
    const time = String(new Date());
    urlDatabase[shortURL]["timestamps"].push(time);
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
  let templateVars = {};

  if (isTinyUrl(shortURL, urlDatabase)) {
      
    if (!req.session.userId) {
      error = "Please login";

    } else if (!isOwnURL(req.session.userId, shortURL, urlDatabase)) {        // case the short URL belongs to another user
      error = "This URL has a different owner";

    } else {
      longURL = urlDatabase[shortURL].longURL;
      templateVars = {
        shortURL,
        longURL,
        "user": users[req.session.userId],
        date: urlDatabase[shortURL].date,
        visits: urlDatabase[shortURL].visits,
        visitors : urlDatabase[shortURL].visitors,
        timestamps: urlDatabase[shortURL].timestamps,
        error
      };
      res.render("urls_show", templateVars);
      return;
    }
  } else {
    error = "Short URL doesn't exist";
    templateVars = {"user": users[req.session.userId], error};
    res.render("urls_index", templateVars);
  }
});

// route to process the edit urls (only the specific user can edit)
app.put("/urls/:id", (req, res) => {
  let error = null;
  if (!req.session.userId) {
    error = "Please Login";
  } else if (!isOwnURL(req.session.userId, req.params.id, urlDatabase)) {
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
  } else if (!isOwnURL(req.session.userId, req.params.id, urlDatabase)) {
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
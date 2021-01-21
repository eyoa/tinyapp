const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
let cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "spongebob" },
  PgM3djJ:{ longURL: "https://www.example.edu", userID: "spongebob2" }
};

const users = {
  "spongebob": {
    id: "spongebob",
    email: "pineapple@underthesea.com",
    password: "yellow"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "snacks@latenight.com",
    password: "cookies"
  },
  "spongebob2": {
    id: "spongebob2",
    email: "pineapple@undertheC.com",
    password: "123"
  },

};


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


const nonValidReg = function(newMail, pass) {
  if (!newMail || !pass) {
    console.log("empty");
    return true;
  }
  for (let user in users) {
    if (users[user]["email"] === newMail) {
      return true;
    }
  }
  return false;
};

const isUser = function(mail, pass) {
  if (!mail || !pass) {
    console.log("empty login details");
    return false;
  }
  if (users[mail]) {
    if (users[mail].password === pass) {
      console.log('correct login');
      return true;
    }
  }
  console.log("not valid user");
  return false;
};

const urlsForUser = function(id) {
  const results = {};
  for (const entry in urlDatabase) {
    if (urlDatabase[entry].userID === id) {
      results[entry] = urlDatabase[entry];
    }
  }
  return results;
};

const isOwnURL = function(cookieID, urlID) {
  console.log("Is checking is OWN URL ==================================");
  console.log(`cookieID is ${cookieID}`);
  console.log(`URLID is ${urlID}`);
  // console.log(`cookieID is ${cookieID} getting db user info ${urlDatabase[URLID].userID}`);
  if (!cookieID || !urlID) {
    console.log("empty entries");
    return false;
  } else if (urlDatabase[urlID].userID === cookieID) {
    console.log("matches");
    return true;
  }
};



app.get("/", (req, res) => {
  res.send("Hello~! Welcome ");
});

app.get("/urls", (req, res) => {
  let msg = '';
  //If not logged in display message to log in or register
  if (!req.cookies["user_id"]) {
    msg = "Please login";
    console.log("Needs to login");
    // res.send('Please login or Register');
    // res.redirect('/urls/login');
  }
  let test = urlsForUser(req.cookies["user_id"]);
  const templateVars = {urls: test, "user": users[req.cookies["user_id"]], msg: msg};
  res.render("urls_index", templateVars);
});

// route to page that can create new tiny URLS
app.get("/urls/new", (req, res) =>{
  if (req.cookies["user_id"]) {
    const templateVars = {"user": users[req.cookies["user_id"]]};
    res.render("urls_new", templateVars);
    res.end();
  }
  
  res.redirect('/urls/login');
});

app.post("/urls", (req, res) => {
  const newStr = generateRandomString();
  let newUrlObj = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  urlDatabase[newStr] = newUrlObj;
  res.redirect(`/urls/${newStr}`);
});

app.get("/urls/register", (req, res) => {
  const templateVars = {"user": users[req.cookies["user_id"]]};
  res.render('urls_register', templateVars);
});

app.post("/urls/register", (req, res) => {
  let id = req.body.email;
  let email = req.body.email;
  let password = req.body.password;

  if (nonValidReg(email, password)) {
    res.sendStatus(400);
    res.end();
  }
  users[id] = {id, email, password};
  res.cookie("user_id", id);
  res.redirect('/urls');
});

app.get("/urls/login", (req, res) => {
  const templateVars = {"user": users[req.cookies["user_id"]]};
  res.render("urls_login", templateVars);
});

app.post("/urls/login", (req, res) => {
  let id = req.body.email;
  let pass = req.body.password;
  if (isUser(id, pass)) {
    res.cookie("user_id", id);
    res.redirect('/urls');
    res.end();
  }
  res.sendStatus(403);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// route to edit URLS page
app.get("/urls/:shortURL", (req, res) => {
  let msg = '';
  if (!req.cookies["user_id"]) {
    msg = "Please login";
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    "user": users[req.cookies["user_id"]],
    msg: msg
  };
  res.render("urls_show", templateVars);
  // let msg = '';
  // //If not logged in display message to log in or register
  // if (!req.cookies["user_id"]){
  //   msg = "Please login"
  //   console.log("Needs to login");
  //   // res.send('Please login or Register');
  //   // res.redirect('/urls/login');
  // }
  // let test = urlsForUser(req.cookies["user_id"]);
  // const templateVars = {urls: test, "user": users[req.cookies["user_id"]], msg: msg};
  // res.render("urls_index", templateVars);
});



// route to edit URLS
app.post("/urls/:shortURL", (req, res) => {
  //if the cookie matches the userID
  console.log(`Is it getting the short URL? ${req.params.shortURL}`);
  if (isOwnURL(req.cookies["user_id"], req.params.shortURL)) {
    urlDatabase[req.params.shortURL].longURL = req.body.editURL;
  }

  res.redirect("/urls");
});

// route to remoce URL entries
app.post("/urls/:shortURL/delete", (req, res) => {
  //if the cookie matches the userID
  if (isOwnURL(req.cookies["user_id"], req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect(`/urls/`);

});

//route to logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

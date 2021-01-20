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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
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



app.get("/", (req, res) => {
  res.send("Hello~!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, "user": users[req.cookies["user_id"]]};
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) =>{
  const templateVars = {"user": users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const newStr = generateRandomString();
  urlDatabase[newStr] = req.body.longURL;
  res.redirect(`/urls/${newStr}`);
});

app.get("/urls/register", (req, res) => {
  const templateVars = {"user": users[req.cookies["user_id"]]};
  res.render('urls_register', templateVars);
});

app.post("/urls/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let pass = req.body.password;

  if (nonValidReg(email, pass)) {
    res.sendStatus(400);
    res.end();
  }

  console.log("This shouldn't run");
  users[id] = {id, email, pass};
  res.cookie("user_id", id);
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    "user": users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.editURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls/`);

});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

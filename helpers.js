const bcrypt = require('bcrypt');

// returns user Object when passed an email and database.
// returns undefined if either is blank or there is no matching entry
const getUserByEmail = function(email, database) {
  if (!email || !database) {
    return undefined;
  }
  
  for (const entry in database) {
    if (database[entry].email === email) {
      return database[entry];
    }
  }
  return undefined;
};

// checks if the the email already exists
const isValidReg = function(newMail, pass, users) {
  if (!newMail || !pass) {
    return false;
  }
  if (getUserByEmail(newMail, users)) {
    return false;
  }
  return true;
};

// generates string for tiny URLS and maybe user ids
const generateRandomString = function() {
  const result = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
  const numChars = 7;
  for (let i = 0; i < numChars; i++) {
    const c = Math.floor(Math.random() * 61);
    result.push(chars[c]);
  }
  return result.join('');
};

// Returns current date as a string (UTC timezone)
const getDate = function() {
  const date = new Date();
  return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
};

// checks if the a URL object belongs to the current user
const isOwnURL = function(cookieID, urlID, urlDatabase) {
  return (!cookieID || !urlID) ? false
    : (urlDatabase[urlID].userID === cookieID) ? true
      : false;
};

// checks for user authentication returns user id if valid
const getUser = function(mail, pass, users) {
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
const getOwnURLs = function(id, urlDatabase) {
  const results = {};
  for (const entry in urlDatabase) {
    if (urlDatabase[entry].userID === id) {
      results[entry] = urlDatabase[entry];
    }
  }
  return results;
};

// Checks if short url exists in database
const isTinyUrl = function(shortURL, urlDatabase) {
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

// checkes if visitorID is unique and returns boolean value. Will add new unique visitor.
const isUniqueVisitor = function(shortURL, visitorId, urlDatabase) {
  let visitorList = urlDatabase[shortURL].visitors;
  for (const id of visitorList) {
    if (id === visitorId) {
      return false;
    }
  }
  urlDatabase[shortURL].visitors.push(visitorId);
  return true;
};


module.exports = {
  generateRandomString,
  getDate,
  isValidReg,
  isOwnURL,
  getUser,
  getOwnURLs,
  isTinyUrl,
  isUniqueVisitor
};
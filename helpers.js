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
  const numChars = 6 + 1;
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


module.exports = {
  getUserByEmail,
  generateRandomString,
  getDate,
  isValidReg
};
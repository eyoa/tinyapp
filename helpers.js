// returns user Object when passed an email and database.
// returns undefined if either is blank or there is no matching entry
const getUserByEmail = function(email, database){
  if (!email || !database){
    return undefined;
  }
  
  for(const entry in database){
    if(database[entry].email === email){
      return database[entry];
    }
  }  
  return undefined;
}

module.exports = {getUserByEmail};
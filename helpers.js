const getUserByEmail = function(email, database){
  if (!email || !database){
    return false;
  }
  
  for(const entry in database){
    if(database[entry].email === email){
      return database[entry];
    }
  }  
  return user;
}

module.exports = {getUserByEmail};
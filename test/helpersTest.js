const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    users = {...testUsers};
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    
    assert.equal(user.id, expectedOutput);
  });
  it('should return undefined with email not in database', function() {
    users = {...testUsers};
    const user = getUserByEmail("pineapple@example.com", users)
    const expectedOutput = undefined;
    
    assert.equal(user, expectedOutput);
  });
  it('should return undefined with blank email', function() {
    users = {...testUsers};
    const user = getUserByEmail("", users)
    const expectedOutput = undefined;
    
    assert.equal(user, expectedOutput);
  });
});

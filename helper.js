function generateRandomString() {
  let randomString = Math.random().toString(36).substring(3, 9);
  return randomString;
}

function getUserByEmail(email, users) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key].id; 
    }
  }
  return null;
}

module.exports = { getUserByEmail, generateRandomString };


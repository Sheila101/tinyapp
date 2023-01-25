function generateRandomString() {
  let randomString = Math.random().toString(36).substring(3, 9);
  return randomString;
}

function getUserByEmail(email, users) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key]; 
    }
  }
  return null;
}
function urlsForUser(id, urlDatabase){
  const urls = {};
  for(const shortURL in urlDatabase){
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
}

module.exports = { getUserByEmail, generateRandomString };


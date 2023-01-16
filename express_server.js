const express = require("express");
const cookieParser = require('cookie-parser');
const app = express(); 
const PORT = 8080; 

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs")

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`);
});

app.get('/urls', (req, res) => {
  const templeateVars = { 
  urls: urlDatabase, 
  user: users[req.cookies["user_id"]],
   };
   console.log(users);
   console.log(req.cookies["user_id"]);

  console.log(templeateVars); 
  res.render("urls_index", templeateVars);
  // console.log(users[req.cookies["user_id"]]);
  
}); 

//Shows the form
app.get("/urls/new", (req, res) => {
  const templeateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render("urls_new", templeateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); //Log the POST request body to the console
  res.send("ok"); 
});

app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const templeateVars = {
    user: users[req.cookies["user_id"]],
    id: shortURL,
    longURL,
  };
  res.render('urls_show', templeateVars);
}); 

app.post('/urls', (req, res) => {
  const id =  generateRandomString();
  urlDatabase[id] = req.body.longURL; 
  res.redirect(`/urls/${id}`);
})

app.get('/urls/:id/delete', (req, res) =>{
  const shortURL = req.params.id;
  delete urlDatabase[shortURL]; 
  res.redirect("/urls");
});

app.post('/urls/:id/edit', (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.editURL;
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) =>{
  const shortURL = req.params.id; 
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  
  res.cookie("username", username);
  if(username){
    console.log(`You have successfully logged in with ${username}`)
  }
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {

  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  res.render('register');
 
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //create new user
  const user_id = generateRandomString();
  users[user_id] = {
    id: user_id,
    email,
    password,
  };
  console.log(users);

  //check if user already exists
  for (const key in users) {
    if (key.email === email) {
      return res
        .status(400)
        .send(`User with that email ${email} already exists`);
    }
  }

  res.cookie('user_id', user_id);
  res.redirect('/urls');
});

function generateRandomString() {
  let randomString = Math.random().toString(36).substring(3, 9);
  return randomString; 
}

app.listen(PORT, () =>{
});


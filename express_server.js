const express = require("express");
const cookiesSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const {generateRandomString, getUserByEmail} = require('./helpers');
const { render } = require("ejs");

const app = express(); 
const PORT = 8080; 


app.use(express.urlencoded({ extended: true }));
app.use(cookiesSession({
  keys: ["monkey"]
}));
app.set("view engine", "ejs")

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
  },
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
    user: users[req.session.user_id],
  };
   console.log(users);
   console.log(req.session.user_id);

  console.log(templeateVars); 
  res.render("urls_index", templeateVars);
  // console.log(users[req.cookies["user_id"]]);
  
}); 

//Shows the form
app.get("/urls/new", (req, res) => {
  const templeateVars = {
    user: users[req.session.user_id = 'user_id'],
  };
  if (!req.session.user_id) {
    res.send(
      '<html><body><h2>You cannot shorten URLS because you are not logged in </h2></body></html>\n'
    );
  }
  res.render("urls_new", templeateVars);
});


app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  const templeateVars = {
    user: users[req.session.user_id = 'user_id'],
    id: shortURL,
    longURL,
  };
  res.render('urls_show', templeateVars);
}); 

app.post('/urls', (req, res) => {
   if (!req.session.user_id) {
     res.redirect('/login');
   }
 
  const id =  generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  }; 
  res.redirect(`/urls/${id}`);
})

app.get('/urls/:id/delete', (req, res) =>{
  const shortURL = req.params.id;
  delete urlDatabase[shortURL]; 
  res.redirect("/urls");
});

app.post('/urls/:id/edit', (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.editURL;
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) =>{
  const shortURL = req.params.id; 
  const longURL = urlDatabase[shortURL];
  if(!urlDatabase.id){
    res.send(
      '<html><body><h2>That ID does not exist in the database</h2></body></html>\n'
    );
  }
  res.redirect(longURL);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

   //search the users database for the user
    let foundUser;
    foundUser = getUserByEmail(email, users)
    console.log(`foundUser is ${foundUser}`)

    //if no user, return 400 (bad request)
    if (!foundUser) {
        return res.status(400).send(`No user with email ${email} found`);
    }

    // compare user password to request password
    if (!bcrypt.compareSync('purple-monkey-dinosaur', hashedPassword)) {
      return res.status(401).send('Incorrect password');
    }
req.session.user_id = foundUser.id;
 
  res.redirect('/urls');
});

app.get('/login', (req,res) => {
  res.render('login');
});

app.post('/logout', (req, res) => {

  req.session = null;
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  res.render('register');
 
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //check if user already exists
  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send(`User with that email ${email} already exists`);
  }

  //create new user
  const user_id = generateRandomString();
  users[user_id] = {
    id: user_id,
    email,
    password,
  };

  users[user_id].password = bcrypt.hashSync(password, 10);

  console.log(users);
    req.session.user_id = user_id;
    res.redirect('/urls');

});



app.listen(PORT, () =>{
});


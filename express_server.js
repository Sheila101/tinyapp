const express = require("express");
const cookiesSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; 

const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
} = require('./helpers');
const { render } = require("ejs");

//MiddleWare
app.use(express.urlencoded({ extended: true }));
app.use(cookiesSession({
  keys: ["flower"]
}));
app.set("view engine", "ejs")

//Databse
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
    password: bcrypt.hashSync('purple-monkey-dinosaur'),
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

//Response with database as a JSON file
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

//Routing to urls page
app.get('/urls', (req, res) => {
  //check if user exists
   if (!req.session.user_id) {
     //return res.redirect('/login');
      return res.send(
        '<html><body><h2>You cannot shorten URLS because you are not logged in </h2></body></html>\n'
      );
   }
   const userUrlDatabase = urlsForUser(req.session.user_id, urlDatabase);

  const templeateVars = {
    urls: userUrlDatabase,
    user: users[req.session.user_id],
  };
   console.log(users);
   console.log(req.session.user_id);

  console.log(templeateVars); 
  res.render("urls_index", templeateVars);
  // console.log(users[req.cookies["user_id"]]);
  
}); 

//Shows the form to add new urls
app.get("/urls/new", (req, res) => {
  const templeateVars = {
    user: users[req.session.user_id = 'user_id'],
  };
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  res.render("urls_new", templeateVars);
});

//Responds with the url with the specific id
app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.send(
      '<html><body><h2>The short URL does not exist</h2></body></html>\n'
    );
  }
  if(!req.session.user_id){
    return res.send(
      '<html><body><h2>You need to be logged in to view this page</h2></body></html>\n'
    );
  } 

  if(req.session.user_id !== urlDatabase[shortURL].userID){
     return res.send(
       '<html><body><h2>You are not the owner of this URL</h2></body></html>\n'
     );
  }
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
      return res.send(
        '<html><body><h2>You need to be logged in to view this page</h2></body></html>\n'
      );
   }
 
  const id =  generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  }; 
  res.redirect(`/urls/${id}`);
})

//Functinality for user to delete
app.post('/urls/:id/delete', (req, res) =>{
  const shortURL = req.params.id;
  if (!req.session.user_id) {
    return res.send(
      '<html><body><h2>You need to be logged in to view this page</h2></body></html>\n'
    );
  }

  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.send(
      '<html><body><h2>You are not the owner of this URL</h2></body></html>\n'
    );
  }

  delete urlDatabase[shortURL]; 
  res.redirect("/urls");
});

//Functinality for user to edit
app.post('/urls/:id', (req, res) => {

  const shortURL = req.params.id;

  if (!req.session.user_id) {
    return res.send(
      '<html><body><h2>You need to be logged in to view this page</h2></body></html>\n'
    );
  }

  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.send(
      '<html><body><h2>You are not the owner of this URL</h2></body></html>\n'
    );
  }

  urlDatabase[shortURL].longURL = req.body.editURL;
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) =>{
  const shortURL = req.params.id; 
  const longURL = urlDatabase[shortURL];
  if(!urlDatabase[shortURL]){
    res.send(
      '<html><body><h2>That ID does not exist in the database</h2></body></html>\n'
    );
  }
  res.redirect(longURL);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

   //search the users database for the user
    let foundUser;
    foundUser = getUserByEmail(email, users)
    console.log(`foundUser is ${foundUser}`)

    //if no user, return 400 (bad request)
    if (!foundUser) {
        return res.status(400).send(`No user with email ${email} found`);
    }

    // compare user password to request password
    if (!bcrypt.compareSync(password, foundUser.password)) {
      return res.status(401).send('Incorrect password');
    }
req.session.user_id = foundUser.id;
 
  res.redirect('/urls');
});
//check if user exists, if usercookie exists redierects them to url else render login 
app.get('/login', (req,res) => {
  if (req.session.user_id){
    return res.redirect('/urls');
  } 
  res.render('login');
});

app.post('/logout', (req, res) => {

  req.session = null;
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  if (req.session.user_id){
    return res.redirect('/urls');
  }
  res.render('register');
 
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password){
     return res
       .status(400)
       .send(`Email and password can't be blank`);
  }
  
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
  };

  users[user_id].password = bcrypt.hashSync(password, 10);

  console.log(users);
    req.session.user_id = user_id;
    res.redirect('/urls');

});



app.listen(PORT, () =>{
});


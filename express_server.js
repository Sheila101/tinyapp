const express = require("express");
const app = express(); 
const PORT = 8080; 

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs")

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
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
  const templeateVars = {urls: urlDatabase };
  res.render("urls_index", templeateVars);
}); 

//Shows the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body); //Log the POST request body to the console
  res.send("ok"); 
});

app.get('/urls/:id', (req, res) => {
  const templeateVars = { id: req.params.id, longURL: "www.google.com"};
  res.render('urls_show', templeateVars);
}); 

app.post('/urls', (req, res) => {
  const id =  generateRandomString();
  urlDatabase[id] = req.body.url; 
  res.redirect(`/urls/${id}`);
})

app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]; 
  res.redirect(longURL);
})

app.post('/urls/:id/delete', (req, res) =>{
  delete urlDatabase[req.params.id]; 
  res.redirect("/urls");
});


app.listen(PORT, () =>{
  
});

function generateRandomString(){
  let randomString = Math.random().toString(36).substring(3, 9); 
}
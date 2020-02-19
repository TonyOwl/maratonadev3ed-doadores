// Server configuration
const express = require("express");
const server = express();

server.use(express.static("public"));
server.use(express.urlencoded({ extended: true }));

// DB configuration
const Pool = require("pg").Pool;
const db = new Pool(require("./dbConfig"));

// Middlewares
const nunjucks = require("nunjucks");
nunjucks.configure("./", {
  autoescape: true,
  express: server,
  noCache: true
});

// Routing
server.get("/", function(req, res) {
  try {
    db.query("SELECT * FROM donors", function(err, result) {
      if (err) return res.send("Erro no banco de dados.");

      const donors = result.rows;
      return res.render("index.html", { donors });
    });
  } catch (error) {
    console.log(error.message);
  }
});

server.post("/", function(req, res) {
  const { name, email, blood } = req.body;

  if (name == "" || email == "" || blood == "") {
    return res.send("Todos os campos são obrigatórios.");
  }

  const query = `
    INSERT INTO donors ("name", "email", "blood")
    VALUES ($1, $2, $3)`;

  const values = [name, email, blood];

  db.query(query, values, function(err) {
    if (err) return res.send("Erro no banco de dados.");
    return res.redirect("/");
  });
});

// Server Start
server.listen(3000, function() {
  console.log("Iniciei o servidor.");
});

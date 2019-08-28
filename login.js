var http = require('http');
var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
//var main = require('./main');
//npm install express-session
var bodyParser = require('body-parser');
var path = require('path');
var SQL = require('sql-template-strings');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
});

connection.connect(function(err){
    if(!err){
        console.log("database is connected");
    } else{
        console.log("error connecting to the database");
        console.log(err);
    }
});



app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
app.get("/home", (req, res)=> {
    res.sendFile(path.join(__dirname+ "/index.html"));
});

app.get("/Admin", (req, res)=> {
    res.sendFile(path.join(__dirname+ "/admin.html"));
});

app.get("/addUser", (req, res)=> {
    res.sendFile(path.join(__dirname+ "/adduser.html"));
});

app.get("/Updateuser", (req, res)=> {
    res.sendFile(path.join(__dirname+ "/updateuser.html"));
});

app.get("/Deleteuser", (req, res)=> {
    res.sendFile(path.join(__dirname+ "/deleteuser.html"));
});
app.get("/dashboard", (req, res)=> {
    res.sendFile(path.join(__dirname+ "/dashboard.html"));
	
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
			
				response.redirect('/home');
				
				//response.sendFile(path.join(__dirname + '/dashboard.html'));
				

			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		
	}
});





/**
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
	   // response.send('Welcome back, ' + request.session.username + '!');
	// response.sendFile(path.join(__dirname + '/dashboard.html'));
	  response.sendFile(path.join(__dirname + '/admin.html'));

	//app.use(express.static(path.join(__dirname, '../dashboard.html')));

	
	} else {
		response.send('Please login to view this page!');
	}
	
	response.end();
	
});
**/



app.get("/getAllUsers", (req, res)=> {
   connection.query("SELECT * FROM accounts", function(err, result){
       if(err)
       throw err;
       console.log(result);
       res.send(result);
   });
});

app.post("/addname", (req,res)=> {
    var myData = (req.body);
    var username = myData.username;
    var password = myData.password;
    console.log(username + "" + password + "" );
    var q = SQL`INSERT INTO accounts (username, password) VALUES (${username}, ${password})`;
    connection.query(q, function(error, results){
        if(error){
            console.log("error occurred", error);
            res.send({
                "code":400,
                "failed": "error occurred"
            })
        }else {
            console.log("The added user ID:", results.insertId);
            res.send({
                "code":200,
                "success":"user added successfully",
                "id of user": results.insertId
            });
        }
    });
});

app.post("/updateUser", (req,res)=> {
    var myData = (req.body);
	var id = myData.id;
    var username = myData.username;
    var password = myData.password;
    console.log(username + "" + password + "");
    var q = SQL `update accounts set username = ${username}, password = ${password} where id = ${id}`;
    connection.query(q, function(error, results){
        if(error){
            console.log("error occurred", error);
            res.send({
                "code":400,
                "failed": "error occurred"
            })
        }else {
            console.log("The added user ID:", results.insertId);
            res.send({
                "code":200,
                "success":"user updated successfully",
                "id of user": results.insertid
            });
        }
    });
});

app.post("/deleteUser", (req,res)=> {
    var myData = (req.body);
    var id = myData.id;
   
    console.log("ID to delete:" + id);
    var q = SQL`delete from accounts where id = ${id}`;
    connection.query(q, function(error, results){
        if(error){
            console.log("error occurred", error);
            res.send({
                "code":400,
                "failed": "error occurred"
            })
        }else {
            console.log("The deleted user ID:", results.insertId);
            res.send({
                "code":200,
                "success":"user deleted successfully",
                "id of user": results.insertId
            });
        }
    });
});



app.listen(3000);
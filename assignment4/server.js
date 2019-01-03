const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");
const dataSer = require(path.join(__dirname + "/data-service.js"));
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const exphbs = require('express-handlebars');

app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers:{
        navLink: function(url, options){ 
            return '<li' +
               ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>'; 
        },
        equal: function(lvalue, rvalue, options){
            if(arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if(lvalue != rvalue){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
        }
    }}));
app.set('view engine', '.hbs');

function startListen() {
    console.log("Express http server listening on : " + HTTP_PORT);
}

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, ""); next();
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render('home');
});

app.get("/about", (req, res) => {
    res.render('about');
});

//assignment 3 - route
app.get('/employees', (req, res) => {
    if (req.query.status) {
        dataSer.getEmployeesByStatus(req.query.status)
            .then((data) => res.render("employees", {employees: data}))
            .catch(() => res.render({message: "no results"}));
    } else if (req.query.department) {
        dataSer.getEmployeesByDepartment(req.query.department)
            .then((data) => res.render("employees", {employees: data}))
            .catch(() => res.render({message: "no results"}));
    } else if (req.query.manager) {
        dataSer.getEmployeesByManager(req.query.manager)
            .then((data) => res.render("employees", {employees: data}))
            .catch(() => res.render({message: "no results"}));
    } else {
        dataSer.getAllEmployees()
            .then((data) => res.render("employees", {employees: data}))
            .catch(() => res.render({message: "no results"}))
    }
});

app.get("/employee/:employeeNum", (req, res) => {
    dataSer.getEmployeeByNum(req.params.employeeNum)
        .then((data) => res.render('employee',{employee: data}))
        .catch(() => res.render('employee', {message: "no results"}))
});

app.get('/departments', (req, res) => {
    dataSer.getDepartments()
        .then((data) => res.render('departments', {department: data}))
        .catch(() => res.render({ message: "no results" }))
});

//assignment 3 - routes 
app.get('/employees/add', (req, res) => {
    res.render('addEmployee');
});

app.get('/images/add', (req, res) => {
    res.render('addImage');
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", function (err, items) {
        res.render("images", {data: items});
    });
});

app.post("/employees/add", (req, res) => {
    dataSer.addEmployee(req.body)
        .then(() => res.redirect("/employees"))
        .catch((err) => res.json({ "message": err }));
});

app.post("/employee/update", (req, res) => {
    dataSer.updateEmployee(req.body)
       .then(res.redirect("/employees"))
       .catch((err) => res.json({ "message": err }));
});

app.use((req, res) => {
    res.status(404).send("https://medium.com/@CollectUI/404-page-design-inspiration-march-2017-f6d9f7efd054");
});

// setup http server to listen on HTTP_PORT
dataSer.initialize()
    .then(() => {
        app.listen(HTTP_PORT, startListen);
    }).catch(() => {
        console.log("Initializing Error");
    });
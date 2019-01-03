const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");
const dataSer = require(path.join(__dirname + "/data-service.js"));
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");

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

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/views/home.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname + "/views/about.html"));
});

//assignment 3 - route
app.get('/employees', (req, res) => {
    if (req.query.status) {
        dataSer.getEmployeesByStatus(req.query.status)
            .then((data) => res.json(data))
            .catch((err) => res.json({ "message": err }));
    } else if (req.query.department) {
        dataSer.getEmployeesByDepartment(req.query.department)
            .then((data) => res.json(data))
            .catch((err) => res.json({ "message": err }));
    } else if (req.query.manager) {
        dataSer.getEmployeesByManager(req.query.manager)
            .then((data) => res.json(data))
            .catch((err) => res.json({ "message": err }));
    } else {
        dataSer.getAllEmployees()
            .then((data) => res.json(data))
            .catch((err) => res.json({ "message": err }))
    }
});

app.get("/employee/:employeeNum", (req, res) => {
    dataSer.getEmployeeByNum(req.params.employeeNum)
        .then((data) => res.json(data))
        .catch((err) => res.json({ "message": err }))
});

app.get('/managers', (req, res) => {
    dataSer.getManagers()
        .then((data) => res.json(data))
        .catch((err) => res.json({ "message": err }))
});

app.get('/departments', (req, res) => {
    dataSer.getDepartments()
        .then((data) => res.json(data))
        .catch((err) => res.json({ "message": err }))
});

//assignment 3 - routes 
app.get('/employees/add', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
});

app.get('/images/add', (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addImage.html"));
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", function (err, items) {
        var array = { images: items };
        res.json(array);
    });
});

app.post("/employees/add", (req, res) => {
    dataSer.addEmployee(req.body)
        .then(() => res.redirect("/employees"))
        .catch((err) => res.json({ "message": err }))
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
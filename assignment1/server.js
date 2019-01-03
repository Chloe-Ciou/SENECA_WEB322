const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require('path');
const dataSer = require(path.join(__dirname+"/data-service.js"));
const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
var sequelize = new Sequelize('d292dpr5jg7nsr', 'wpaehgotudfdhv', '0462238c1125c3e0e5a18279898f90d81f7c01cc5958bd62b226ef11af0e8bfc', {
    host: 'ec2-54-243-61-194.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});


sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });

function startListen(){
    console.log("Express http server listening on : " + HTTP_PORT);
}
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname+"/views/home.html"));
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname+"/views/about.html"));
});

app.get('/employees', (req, res) => {
    dataSer.getAllEmployees()
        .then((data) => res.json(data))
        .catch((err) => res.json({"message": err}))
});

app.get('/managers', (req, res) => {
    dataSer.getManagers()
        .then((data) => res.json(data))
        .catch((err) => res.json({"message": err}))
});



app.get('/departments', (req, res) => {
    dataSer.getDepartments()
        .then((data) => res.json(data))
        .catch((err) => res.json({"message": err}))
})

app.use((req, res) => {
    res.status(404).send("https://medium.com/@CollectUI/404-page-design-inspiration-march-2017-f6d9f7efd054");
})

// setup http server to listen on HTTP_PORT
dataSer.initialize()
.then(() => {
    app.listen(HTTP_PORT, startListen);
}).catch(() => {
    console.log("Initializing Error");
})
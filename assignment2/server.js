const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require('path');
const dataSer = require(path.join(__dirname+"/data-service.js"));

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
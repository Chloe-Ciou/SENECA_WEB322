/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this 
* assignment has been copied manually or electronically from any other source (including web sites) or
* distributed to other students.
*
* Name: Yuru Ciou Student ID: 115895179 Date: 11/19/2018 *
* Online (Heroku) Link: https://web322assignment5yuruciou.herokuapp.com/
* ********************************************************************************/

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
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
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
app.use(function (req, res, next) {
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

app.get('/employees/add', (req, res) => {
    dataSer.getDepartments()
        .then((data) => res.render('addEmployee', { departments: data }))
        .catch(() => res.render("addEmployee", { departments: [] }));
});

app.get('/departments/add', (req, res) => {
    res.render("addDepartment");
    
});

app.get('/images/add', (req, res) => {
    res.render('addImage');
});

app.get("/employee/:empNum", (req, res) => {
    let viewData = {};
    dataSer.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; 
        } else {
            viewData.employee = null; 
        }
    }).catch(() => {
        viewData.employee = null; 
    }).then(dataSer.getDepartments)
    .then((data) => {
        viewData.departments = data; 

        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee[0].department) {
                viewData.departments[i].selected = true;
            }
        }
    }).catch(() => {
        viewData.departments = []; 
    }).then(() => {
        if (viewData.employee == null) { 
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", { viewData: viewData }); 
        }
    });
});

app.get("/employees/delete/:empNum", (req, res) => {
    dataSer.deleteEmployeeByNum(req.params.empNum)
        .then(() => res.redirect("/employees"))
        .catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"));
});

app.get("/department/:departmentId", (req, res) => {
    dataSer.getDepartmentById(req.params.departmentId)
        .then((data) => {
            if (data.length) res.render('department', { department: data });
            else res.status(404).send("Department Not Found");
        }).catch(() => res.status(404).send("Department Not Found"));
});

app.get('/employees', (req, res) => {
    if (req.query.status) {
        dataSer.getEmployeesByStatus(req.query.status)
            .then((data) => {
                if (data) {
                    res.render("employees", { employees: data });
                } else {
                    res.render("employees", { message: "no results" });
                }
            }).catch(() => res.render("employees", { message: "no results" }));
    } else if (req.query.department) {
        dataSer.getEmployeesByDepartment(req.query.department)
            .then((data) => {
                if (data.length) {
                    res.render("employees", { employees: data });
                } else {
                    res.render("employees", { message: "no results" });
                }
            }).catch(() => res.render("employees", { message: "no results" }));
    } else if (req.query.manager) {
        dataSer.getEmployeesByManager(req.query.manager)
            .then((data) => {
                if (data.length) {
                    res.render("employees", { employees: data });
                } else {
                    res.render("employees", { message: "no results" });
                }
            }).catch(() => res.render("employees", { message: "no results" }));
    } else {
        dataSer.getAllEmployees()
            .then((data) => {
                if (data.length) {
                    res.render("employees", { employees: data });
                } else {
                    res.render("employees", { message: "no results" });
                }
            }).catch(() => res.render("employees", { message: "no results" }));
    }
});

app.get('/departments', (req, res) => {
    dataSer.getDepartments()
        .then((data) => {
            if (data.length) {
                res.render('departments', { department: data })
            } else {
                res.render('departments', { message: "no results" });
            }
        }).catch(() => res.render('departments', { message: "no results" }));
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.post("/employees/add", (req, res) => {
    dataSer.addEmployee(req.body)
        .then(() => {
            res.redirect("/employees");
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Unable to Add Employee");
        });
});

app.post("/departments/add", (req, res) => {
    dataSer.addDepartment(req.body)
        .then(res.redirect("/departments"))
        .catch((err) => {
            res.status(500).send("Unable to Add Department");
        });
});

app.post("/employee/update", (req, res) => {
    dataSer.updateEmployee(req.body)
        .then(() => res.redirect("/employees"))
        .catch((err) => {
            res.status(500).send("Unable to Update Employee");
        });
});

app.post("/department/update", (req, res) => {
    dataSer.updateDepartment(req.body)
        .then(() => res.redirect("/departments"))
        .catch((err) => {
            res.status(500).send("Unable to Update Department");
        });
});

app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", function (err, items) {
        res.render("images", { data: items });
    });
});

app.get("/departments/delete/:departmentId", (req, res) => {
    console.log("/departments/delete/:departmentId " + req.params.departmentId);
    dataSer.deleteDepartmentById(req.params.departmentId)
        .then(() => { 
            res.redirect("/departments");
    }).catch(() => res.status(500).send("Unable to Remove Department / Department not found"));
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
const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");
const dataSer = require(path.join(__dirname + "/data-service.js"));
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const exphbs = require('express-handlebars');
const dataServiceAuth = require(path.join(__dirname + "/data-service-auth.js"));
const clientSessions = require("client-sessions");

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
// Setup client-sessions
app.use(clientSessions({
    cookieName: "session",
    secret: "web322_a6",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

app.get("/", (req, res) => {
    res.render('home');
});

app.get("/about", (req, res) => {
    res.render('about');
});

app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get('/employees/add', ensureLogin, (req, res) => {
    dataSer.getDepartments()
        .then((data) => res.render('addEmployee', { departments: data }))
        .catch(() => res.render("addEmployee", { departments: [] }));
});

app.get('/departments/add', ensureLogin, (req, res) => {
    res.render("addDepartment");

});

app.get('/images/add', ensureLogin,  (req, res) => {
    res.render('addImage');
});

app.get("/employee/:empNum", ensureLogin, (req, res) => {
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

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    dataSer.deleteEmployeeByNum(req.params.empNum)
        .then(() => res.redirect("/employees"))
        .catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"));
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
    dataSer.getDepartmentById(req.params.departmentId)
        .then((data) => {
            if (data.length) res.render('department', { department: data });
            else res.status(404).send("Department Not Found");
        }).catch(() => res.status(404).send("Department Not Found"));
});

app.get('/employees', ensureLogin, (req, res) => {
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

app.get('/departments', ensureLogin, (req, res) => {
    dataSer.getDepartments()
        .then((data) => {
            if (data.length) {
                res.render('departments', { department: data })
            } else {
                res.render('departments', { message: "no results" });
            }
        }).catch(() => res.render('departments', { message: "no results" }));
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
    .then((user)=>{
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/employees');
    })
    .catch((err) => {
        res.render('login', {errorMessage: err, userName: req.body.userName});
    });
});

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render("userHistory");
});

app.get("/images", ensureLogin, (req, res) => {
    fs.readdir("./public/images/uploaded", function (err, items) {
        res.render("images", { data: items });
    });
});

app.get("/departments/delete/:departmentId", ensureLogin, (req, res) => {
    console.log("/departments/delete/:departmentId " + req.params.departmentId);
    dataSer.deleteDepartmentById(req.params.departmentId)
        .then(() => {
            res.redirect("/departments");
        }).catch(() => res.status(500).send("Unable to Remove Department / Department not found"));
});

// post
app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body)
    .then(()=>{
        res.render("register",{successMessage: "User created"});
    })
    .catch((err) => {
        res.render("register", {errorMessage: err, userName: req.body.userName});
    }); 
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.post("/employees/add", ensureLogin, (req, res) => {
    dataSer.addEmployee(req.body)
        .then(() => {
            res.redirect("/employees");
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Unable to Add Employee");
        });
});

app.post("/departments/add", ensureLogin, (req, res) => {
    dataSer.addDepartment(req.body)
        .then(res.redirect("/departments"))
        .catch((err) => {
            res.status(500).send("Unable to Add Department");
        });
});

app.post("/employee/update", ensureLogin, (req, res) => {
    dataSer.updateEmployee(req.body)
        .then(() => res.redirect("/employees"))
        .catch((err) => {
            res.status(500).send("Unable to Update Employee");
        });
});

app.post("/department/update", ensureLogin, (req, res) => {
    dataSer.updateDepartment(req.body)
        .then(() => res.redirect("/departments"))
        .catch((err) => {
            res.status(500).send("Unable to Update Department");
        });
});

app.use((req, res) => {
    res.status(404).send("https://medium.com/@CollectUI/404-page-design-inspiration-march-2017-f6d9f7efd054");
});

// setup http server to listen on HTTP_PORT
dataSer.initialize()
    .then(dataServiceAuth.initialize)
    .then(() => {
        app.listen(HTTP_PORT, startListen);
    }).catch((err) => {
        console.log("unable to start server: " + err);
    });
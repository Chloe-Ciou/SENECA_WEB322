var employees = [];
var departments = [];
const fs = require('fs');
const path = require('path');

module.exports.initialize = function() {
    let valid = true;
    fs.readFile(path.join(__dirname, 'data/employees.json'), 'utf-8', (err, data) => { 
        employees = JSON.parse(data);
        if(err) valid = false;
    });
    if(valid){
        fs.readFile(path.join(__dirname, 'data/departments.json'), 'utf-8', (err, data1) => {
            departments = JSON.parse(data1);
            if(err) valid = false;
        });
    }
    return new Promise((resolve, reject) => {
        if(valid) resolve("Init Success");
        reject("unable to read file");
    });
};

module.exports.getAllEmployees = function(){
    return new Promise((resolve, reject) => {
        resolve(employees);
        if(employees.length == 0)
        reject("no results returned");
    });
};

module.exports.getManagers = function(){
    return new Promise((resolve, reject) => {
        let managers = employees.filter(employees => employees.isManager == true);
        resolve(managers);
        if(employees.length == 0)
        reject("no results returned");
    });
};

module.exports.getDepartments = function(){
    return new Promise((resolve, reject) => {
        resolve(departments);
        if (departments.length == 0)
        reject("no results returned");
    });

};  
const Sequelize = require('sequelize');
var sequelize = new Sequelize('d3o82prcndjicc', 'zxjmatimveoihw', '2b8a46b91c0b6d630c097ee940e64a3d05de6609d3fceb755a9a15f68e2af88d', {
    host: 'ec2-54-243-46-32.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

const Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    martialStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING,
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});

Department.hasMany(Employee, { foreignKey: 'department' });

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(() => reject("unable to sync the database"));
    });
};

module.exports.getAllEmployees = function () {
    return new Promise((resolve, reject) => {
        Employee.findAll()
            .then(() => resolve(Employee.findAll()))
            .catch(() => reject("no results returned"));
    });
};

module.exports.getDepartments = function () {
    return new Promise((resolve, reject) => {
        Department.findAll()
            .then(() => resolve(Department.findAll()))
            .catch(() => reject("no results returned"));
    });
};

module.exports.getEmployeesByStatus = function (status) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: { status: status }
        }).then(() => resolve(Employee.findAll({
            where: { status: status }
        }))).catch(() => reject("no results returned"));
    });
};

module.exports.getEmployeesByDepartment = function (department) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: { department: department }
        }).then(() => resolve(Employee.findAll({
            where: { department: department }
        }))).catch(() => reject("no results returned"));
    });
};

module.exports.getEmployeesByManager = function (manager) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: { employeeManagerNum: manager }
        }).then(() => resolve(Employee.findAll({
            where: { employeeManagerNum: manager }
        }))).catch(() => reject("no results returned"));
    });
};

module.exports.getEmployeeByNum = function (num) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: { employeeNum: num }
        }).then(() => resolve(Employee.findAll({
            where: { employeeNum: num }
        }))).catch(() => reject("no results returned"));
    });
};

exports.addEmployee = function (employeeData) {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for (var i = 0 in employeeData) {
        if (employeeData[i] == "") employeeData[i] = null;
    }
    return new Promise((resolve, reject) => {
        Employee.create(employeeData)
            .then(() => resolve())
            .catch(() => reject("unable to create employee"))
    });
};

module.exports.updateEmployee = function (employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (var i = 0 in employeeData) {
            if (employeeData[i] == "") employeeData[i] = null;
        }
        Employee.update( employeeData,{
                where: { employeeNum: employeeData.employeeNum }
            }).then(() => resolve())
            .catch(() => reject("unable to update employee"));
    });
};

module.exports.deleteEmployeeByNum = function (empNum) {
    return new Promise((resolve, reject) => {
        Employee.destroy({
            where: { employeeNum: empNum }
        }).then(() => resolve())
            .catch(() => reject("Deletion was rejected"));
    });
};

module.exports.updateDepartment = function (departmentData) {
    if (departmentData.departmentName == "") departmentName = null;
    return new Promise((resolve, reject) => {
        Department.update({
            departmentData
        }, {
                where: { departmentId: departmentData.departmentId }
            }).then(() => resolve(Department.update(departmentData, {
                where: { departmentId: departmentData.departmentId }
            }))).catch(() => reject("unable to update department"));
    });
};

module.exports.addDepartment = function (departmentData) {
    if (departmentData.departmentName == "") departmentName = null;
    return new Promise((resolve, reject) => {
        Department.create(departmentData)
            .then(() => resolve())
            .catch(() => reject("unable to create department"));
    });
};

module.exports.getDepartmentById = function (id) {
    return new Promise((resolve, reject) => {
        Department.findAll({
            where: { departmentId: id }
        }).then(() => resolve(Department.findAll({
            where: { departmentId: id }
        }))).catch(() => reject("no results returned"));
    });
};

module.exports.deleteDepartmentById = function (id) {
    return new Promise((resolve, reject) => {
        Department.destroy({
            where: { departmentId: id }
        }).then(() => resolve())
            .catch(() => reject("Deletion was rejected"));
    });
};
const inquirer = require('inquirer');
const connection = require('../config/connection');
const employeeQueries = require('../models/employeeTracker/employeeQueries');
// const app = require('../app');

const viewEmployees = async () => {
  try {
      const [employees] = await connection.query(employeeQueries.findAllEmployees);
      const newTableArr = [];

      for (let i = 0; i < employees.length; i++) {
        let managerName = '';
        if (employees[i].manager_id !== null) {
          for (let j = 0; j < employees.length; j++) {
            if (employees[j].id === employees[i].manager_id) {
              managerName = `${employees[j].first_name} ${employees[j].last_name}`;
            }
          }
        } else {
          managerName = null;
        }

        const newTable = {
          id: employees[i].id,
          first_name: employees[i].first_name,
          last_name: employees[i].last_name,
          title: employees[i].title,
          department: employees[i].department,
          salary: employees[i].salary,
          manager: managerName,
        };
        newTableArr.push(newTable);
      }
      console.table(newTableArr);
      // app.initialize();
  } catch (err) {
    throw err;
  }
};

const viewEmployeesByDepartment = async () => {
  try {
    const [departments] = await connection.query(employeeQueries.findAllDepartments);
    const departmentArr = [];
    for (let i = 0; i < departments.length; i++) {
      departmentArr.push(departments[i].name);
    }

    const { employeesByDep } = await inquirer.prompt(
      {
        type: 'list',
        name: 'employeesByDep',
        message: 'Which department do you want to see the list of employees for that selected department?',
        choices: departmentArr,
      },
    );

    const [employeesByDepRes] = await connection.query(employeeQueries.findAllEmployeesByDep, employeesByDep);
    console.table(employeesByDepRes);
  } catch (err) {
    throw err;
  }
};

const viewEmployeesByManager = async () => {
  try {
    const [employees] = await connection.query(employeeQueries.findAllEmployeesRegular);
    const managerArr = [];

    for (let i = 0; i < employees.length; i++) {
      const fullName = {
        id: employees[i].id,
        name: `${employees[i].first_name} ${employees[i].last_name}`,
      };
      managerArr.push(fullName.name);
    }

    const { employeesByNoId } = await inquirer.prompt(
      {
        type: 'list',
        name: 'employeesByNoId',
        message: 'Do you want to see the list of employees with no managers?',
        choices: ['Yes', 'No'],
      },
    );

    if (employeesByNoId === 'Yes') {
      const [employeesByNoIdRes] = await connection.query(employeeQueries.findAllEmployeesByNoId);
      console.table(employeesByNoIdRes);
    } else {
      const { employeeByManager } = await inquirer.prompt(
        {
          type: 'list',
          name: 'employeeByManager',
          message: 'Which manager do you want to see the list of employees for that selected manager?',
          choices: managerArr,
        },
      );

      const managerId = employees[managerArr.indexOf(employeeByManager)].id;
      const [employeesByManagerRes] = await connection.query(employeeQueries.findAllEmployeesByManagerId, managerId);

      if (employeesByManagerRes.length === 0) {
        console.log('That employee isn\'t a manager because there are no employees under that person!');
      } else {
        console.table(employeesByManagerRes);
      }
    }
  } catch (err) {
    throw err;
  }
};

const addEmployee = async () => {
  try {
    const [roles] = await connection.query(employeeQueries.findAllRoles);
    const roleTitleArr = [];

    for (let i = 0; i < roles.length; i++) {
      roleTitleArr.push(roles[i].title);
    }

    const [employees] = await connection.query(employeeQueries.findAllEmployeesRegular);
    const managerArr = [];

    for (let i = 0; i < employees.length; i++) {
      const fullName = {
        id: employees[i].id,
        name: `${employees[i].first_name} ${employees[i].last_name}`,
      };
      managerArr.push(fullName.name);
    }

    managerArr.push('None');

    const { firstName, lastName, role, manager } = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: 'What is the employee\'s first name?',
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'What is the employee\'s last name?',
      },
      {
        type: 'list',
        name: 'role',
        message: 'What is the employee\'s role?',
        choices: roleTitleArr,
      },
      {
        type: 'list',
        name: 'manager',
        message: 'Who is the employee\'s manager?',
        choices: managerArr,
      },
    ]);

    const roleId = roles[roleTitleArr.indexOf(role)].id;

    if (manager === 'None') {
      await connection.query(employeeQueries.addEmployee, [firstName, lastName, roleId, null]);
      console.log('New employee with no manager successfully added!');
    } else {
      const managerId = employees[managerArr.indexOf(manager)].id;
      await connection.query(employeeQueries.addEmployee, [firstName, lastName, roleId, managerId]);
      console.log('New employee with a manager successfully added!');
    }
  } catch (err) {
    throw err;
  }
};

const removeEmployee = () => {
  console.log('e');
};

const updateEmployeeRole = () => {
  console.log('f');
};

const updateEmployeeManager = () => {
  console.log('g');
};

const viewRoles = async () => {
  try {
    const [roles] = await connection.query(employeeQueries.findAllRoles);
      console.table(roles);
  } catch (err) {
  throw err;
  }
};

const addRole = async () => {
  try {
    const [roles] = await connection.query(employeeQueries.findAllRoles);
    const roleArr = [];

    for (let i = 0; i < roles.length; i++) {
      roleArr.push(roles[i].title);
    }

    const [departments] = await connection.query(employeeQueries.findAllDepartments);
    const deptArr = [];

    for (let j = 0; j < departments.length; j++) {
      deptArr.push(departments[j].name);
    }

    const { title, salary, department } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is the name of the role that you want to add?',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the annual salary for that role?',
      },
      {
        type: 'list',
        name: 'department',
        message: 'Which department do you want to add the role to?',
        choices: deptArr,
      },
    ]);

    const departmentId = departments[deptArr.indexOf(department)].id;

    if (roleArr.includes(title)) {
      console.log('That role already exists!');
    } else {
      await connection.query(employeeQueries.addRole, [title, salary, departmentId]);
      console.log('New role successfully added!');
    }
  } catch (err) {
    throw err;
  }
};

const removeRole = () => {
  console.log('j');
};

const viewDepartments = async () => {
  try {
    const [departments] = await connection.query(employeeQueries.findAllDepartments);
      console.table(departments);
  } catch (err) {
  throw err;
  }
};

const addDepartment = async () => {
  try {
    const [departments] = await connection.query(employeeQueries.findAllDepartments);
    const deptArr = [];

    for (let i = 0; i < departments.length; i++) {
      deptArr.push(departments[i].name);
    }

    const { deptName } = await inquirer.prompt(
      {
        type: 'input',
        name: 'deptName',
        message: 'What is the name of the department that you want to add?',
      },
    );

    if (deptArr.includes(deptName)) {
      console.log('That department already exists!');
    } else {
      await connection.query(employeeQueries.addDepartment, deptName);
      console.log('New department successfully added!');
    }
  } catch (err) {
    throw err;
  }
};

const removeDepartment = () => {
  console.log('m');
};

const viewBudgetByDepartment = () => {
  console.log('n');
};

module.exports = {
  viewEmployees,
  viewEmployeesByDepartment,
  viewEmployeesByManager,
  addEmployee,
  removeEmployee,
  updateEmployeeRole,
  updateEmployeeManager,
  viewRoles,
  addRole,
  removeRole,
  viewDepartments,
  addDepartment,
  removeDepartment,
  viewBudgetByDepartment,
};

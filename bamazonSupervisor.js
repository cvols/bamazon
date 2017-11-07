var inquirer = require('inquirer')
var mysql = require('mysql')
require('console.table')

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'chris',
    password: 'password',
    database: 'bamazon'
})

connection.connect(function (err) {
    if (err) throw err
    start()
})

function start() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'list',
            message: '  ----- Menu Options -----',
            choices: ['View Product Sales by Department', 'Create New Department']
        }
    ]).then(function (response) {
        if (response.list === 'View Product Sales by Department') {
            viewProducts()
        } if (response.list === 'Create New Department') {
            createNewDepartment()
        }
    })
}

function viewProducts() {
    connection.query('select d.department_id, d.department_name, d.over_head_costs, p.product_sales, sum(p.product_sales - d.over_head_costs) as total_profits from departments as d left join (select department_name, SUM(product_sales) as product_sales from products group by department_name )as p on d.department_name = p.department_name group by d.department_id, d.department_name, d.over_head_costs, p.product_sales order by d.department_id', function (err, res) {
        if (err) throw err 

        console.log('')
        console.log('----- View Product Sales by Department -----')
        console.log('')
        console.table(res),[]
    })
    connection.end()
}

function createNewDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department_name',
            message: 'What department would you like to create?'
        },
        {
            type: 'input',
            name: 'over_head_costs',
            message: 'How much are the over head costs?',
            validate: function (val) {
                if (val <= 0) {
                    return 'We have to have over head costs...'
                }
                if (!isNaN(val)) {
                    return true
                } else {
                    return 'Please only enter numbers'
                }
            }
        }
    ]).then(function (response) {
        connection.query('insert into departments set ?',
        [
            {
                department_name: response.department_name,
                over_head_costs: response.over_head_costs
            }
        ])
        console.log('')
        console.log('You created the ' + response.department_name + ' department that has $' + response.over_head_costs + ' dollars of over head costs')
        console.log('')
        connection.end()
    })
}
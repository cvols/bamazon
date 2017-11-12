var inquirer = require('inquirer')
var mysql = require('mysql')

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
            name: 'manager_list',
            message: '----- Menu Options -----',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
        }
    ]).then(function (response) {
        if (response.manager_list === 'View Products for Sale') {
            viewProducts()
        } if (response.manager_list === 'View Low Inventory') {
            lowInventory()
        } if (response.manager_list === 'Add to Inventory') {
            productName()
        } if (response.manager_list === 'Add New Product') {
            addProduct()
        }
    })
}

function viewProducts() {
    console.log('----- Products for Sale -----')

    connection.query('select * from products', function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log('Item ID: ' + res[i].item_id + '\nProduct Name: ' + res[i].product_name + '\nDepartment Name: ' + res[i].department_name + '\nPrice: $' + res[i].price + '\nQuanity in Stock: ' + res[i].stock_quanity + '\n-----')
        }
    })

    connection.end()
}

function lowInventory() {
    console.log('----- Low Inventory -----')

    connection.query('select * from products where stock_quanity < 5', function (err, res) {
        if (res.length != 0) {
            for (var i = 0; i < res.length; i++) {
                console.log('Item ID: ' + res[i].item_id + '\nProduct Name: ' + res[i].product_name + '\nDepartment Name: ' + res[i].department_name + '\nPrice: $' + res[i].price + '\nQuanity in Stock: ' + res[i].stock_quanity + '\n-----')
            }
        } else {
            console.log('')
            console.log('There are no items that have less than 5 in stock.')
            console.log('')
        }
    })

    connection.end()
}

function productName() {
    var productNameArr = []

    // grab stock_quanity with single select statement

    connection.query('select product_name from products', function (err, res) {
        for (var i = 0; i < res.length; i++) {
            productNameArr.push(res[i].product_name)
        }

        addInventory(productNameArr)
    })
}

function addInventory(productNameArr) {
    console.log('----- Add to Inventory -----')

    inquirer.prompt([
        {
            name: 'product_add',
            type: 'list',
            message: 'Which product would you like to update?',
            choices: productNameArr
        },
        {
            name: 'quanity_add',
            type: 'input',
            message: 'How many items would you like to add?',
            validate: function (val) {
                if (val == 0) {
                    return 'You cannot buy 0 items'
                }
                if (!isNaN(val)) {
                    return true
                } else {
                    return 'Please only enter numbers'
                }
            }
        }
    ]).then(function (response) {
        var product = response.product_add
        var add = parseInt(response.quanity_add)

        quanity(product, add)
    })
}

function quanity(product, add) {
    var stockQuanity

    connection.query('select stock_quanity from products where product_name = (?)', [product], function (err, res) {
        stockQuanity = res[0].stock_quanity

        update(stockQuanity, product, add)
    })
}

function update(stockQuanity, product, add) {
    connection.query('update products set ? where ?',
        [
            {
                stock_quanity: stockQuanity + add
            },
            {
                product_name: product
            }, function (err, res) {
                if (err) throw err
            }
        ])
    console.log('')
    console.log('You added ' + add + ' ' + product + 's')
    console.log('')
    connection.end()
}

function addProduct() {
    console.log('----- Add New Product -----')
    inquirer.prompt([
        {
            type: 'input',
            name: 'product_name',
            message: 'What is your product name?'
        },
        {
            type: 'input',
            name: 'department_name',
            message: 'What department does this belong to?'
        },
        {
            type: 'input',
            name: 'price',
            message: 'How much are we selling the product for?',
            validate: function (val) {
                if (val <= 0) {
                    return 'We cannot sell an item for 0 dollars or less'
                }
                if (!isNaN(val)) {
                    return true
                } else {
                    return 'Please only enter numbers'
                }
            }
        },
        {
            type: 'input',
            name: 'stock_quanity',
            message: 'How many items do we have in stock?'
        }
    ]).then(function (response) {
        connection.query('insert into products set ?',
            {
                product_name: response.product_name,
                department_name: response.department_name,
                price: response.price,
                stock_quanity: response.stock_quanity
            }, function (err) {
                if (err) throw err

                console.log('')
                console.log(response.stock_quanity + ' ' + response.product_name + 's ' + 'have been added to ' + response.department_name + ' @ $' + response.price + ' dollars.')
                console.log('')
            })

        connection.end()
    })
}
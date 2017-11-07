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
    var itemsArr = []

    connection.query('select * from products', function (err, res) {
        if (err) throw err
        console.log('      ----- ITEMS FOR SALE -----')
        for (var i = 0; i < res.length; i++) {
            itemsArr.push(res[i].item_id.toString())
            console.log('Item Number: ' + res[i].item_id + '\nName: ' + res[i].product_name + '\nDepartment: ' + res[i].department_name + '\nPrice: $' + res[i].price + '\n----------------------------------------')
        }

        buy(itemsArr)
    })
}

function buy(itemsArr) {
    inquirer.prompt([
        {
            type: 'list',
            name: 'item_number',
            message: 'What Item Number would you like to buy?',
            choices: itemsArr
        },
        {
            type: 'input',
            name: 'buy_quanity',
            message: 'How many would you like to buy?',
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
        var purchase = []

        purchase.push(parseInt(response.item_number))
        purchase.push(parseInt(response.buy_quanity))

        checkQuanity(purchase)
    })
}

function checkQuanity(purchase) {
    var quanity

    connection.query('select * from products where item_id = (?)', [purchase[0]], function (err, res) {
        quanity = res[0].stock_quanity
        parseInt(quanity)
        var name = res[0].product_name
        var price = res[0].price
        var sales = res[0].product_sales

        if (purchase[1] <= quanity) {
            var number = purchase[1]
            var id = purchase[0]
            purchaseItem(number, id, quanity, name, price, sales)
        } else {
            console.log('')
            console.log('Sorry, insufficient quanity!')
            console.log('')

            connection.end()
        }
    })
}

function purchaseItem(number, id, quanity, name, price, sales) {
    connection.query('update products set ? where ?',
        [
            {
                stock_quanity: quanity - number,
                product_sales: sales + (price * number)
            },
            {
                item_id: id
            }, (function (err) {
                if (err) throw err
            })
        ])

    console.log('')
    console.log('You purchased ' + number + ' ' + name + 's for ' + '$' + (price * number) + ' dollars')
    console.log('')

    connection.end()
}

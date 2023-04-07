require('dotenv').config()
var express = require('express');
var app = express();
var cors = require('cors')
const upload = require("express-fileupload")
const fs = require('fs')
const uuid = require("uuid");
var nodemailer = require('nodemailer');
const math = require('mathjs')
app.use(cors())
app.use(upload())

const jwt = require('jsonwebtoken')
const TOKEN = '69c65fbc9aeea59efdd9d8e04133485a09ffd78a70aff5700ed1a4b3db52d33392d67f12c1'
    


function autificationToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, TOKEN, (err, user) => {
        if (err) res.sendStatus(403)
    })
    next()
}

app.get('/user', autificationToken, (req, res) => {
    const User = JSON.parse(fs.readFileSync('./user.json', "utf-8"))
    res.status(200).send(User)
})
app.post('/user', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./user.json', "utf-8"))
    var postUser = true

    for (let i = 0; i < User.length; i++) {
        if(User[i].email === req.body.email) {
         postUser = false
        }
    }
    if (postUser === true) {
        var data = {
            "id": uuid.v1(),
            "email": req.body.email,
            "password": req.body.password,
            "rendom": 0
        }
        User.unshift(data)
        fs.writeFileSync("./user.json", JSON.stringify(User, 0, 2), "utf-8")
        res.status(201).send("Yaratildi")
    } else {
        res.status(400).send("Bunday Email Mavjud")
    }
})
app.delete('/user/:id', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./user.json', "utf-8"))
    User.map((item, key) => {
        if (item.id === req.params.id) {
            User.splice(key, 1)
        }
    })
    fs.writeFileSync("./user.json", JSON.stringify(User, 0, 2), "utf-8")
    res.status(200).send("Ok")
})
app.put('/user/:id', (req, res) => {
    User.map((item, key) => {
        if (item.id === req.params.id) {
            item.email = req.body.email ? req.body.email : item.email
            item.password = req.body.password ? req.body.password : item.password
        }
    })
    fs.writeFileSync("./user.json", JSON.stringify(User, 0, 2), "utf-8")
    res.status(200).send("Ok")

})
app.post('/login', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./user.json', "utf-8"))
    var id = true
    User.map(item => {
        if (item.email === req.body.email && item.password === req.body.password) {
            var password = req.body.password
            var email = req.body.email
            var user = { 'password': password, 'email': email }
            var accessToken = jwt.sign(user, TOKEN)
            res.json({ "accessToken": accessToken })
            id = false
        }
    })
    if (id) {
        res.status(500).send("no")
    }
})

app.post("/email", (req, res) => {
    const userJson = JSON.parse(fs.readFileSync('./user.json', "utf-8"))
    const email = req.body.email
    let PassPut = false
    var rendom = (`${math.floor(math.random() * 1000000)}`).padStart(6, 0)
    for (let i = 0; i < userJson.length; i++) {
        if (email === userJson[i].email) {
            PassPut = true
            userJson[i].rendom = rendom
            var userpass = rendom
        }
    }
    if (PassPut === true) {
        let transporter = nodemailer.createTransport({
            service: "gmail.com",
            auth: {
                user: "asliddinumirzoqov3@gmail.com",
                pass: "tdfbtznxslniblck"
            },
        });
        let mailOptions = {
            from: 'ГПО',
            to: `${email}`,
            subject: "ГПО",
            text: `${userpass}`,
        }
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err)
            } else {
                fs.writeFileSync("./user.json", JSON.stringify(userJson, 0, 2), "utf-8")
                console.log(info.response)
            }
        })
        res.status(200).send("Jo'natildi")
    } else {
        res.status(400).send("Xato")
    }

})
app.post('/change', (req, res) => {
    const userJson = JSON.parse(fs.readFileSync('./user.json', "utf-8"))
    var post = false
    var body = req.body

    for (let i = 0; i < userJson.length; i++) {
        if (userJson[i].email === body.email && userJson[i].rendom === body.rendom) {
            post = true
        }
    }

    if (post === true) {
        res.status(200).send("True")
    } else {
        res.status(400).send("False")
    }
})
app.put('/reset', (req, res) => {
    const userJson = JSON.parse(fs.readFileSync('./user.json', "utf-8"))
    var putData = false
    const body = req.body

    for (let i = 0; i < userJson.length; i++) {
        if (userJson[i].email === body.email) {
            userJson[i].password = body.password
            putData = true
        }
    }
    if (putData === true) {
        res.status(200).send("Parol Yangilandi")
        fs.writeFileSync("./user.json", JSON.stringify(userJson, 0, 2), "utf-8")
    } else {
        res.status(400).send("Email Xato")
    }
})

app.get('/category', (req, res) => {
    const category = JSON.parse(fs.readFileSync('./data.json', "utf-8"))
    const product = JSON.parse(fs.readFileSync('./product.json', "utf-8"))
    for (let i = 0; i < category.length; i++) {
        for (let j = 0; j < product.length; j++) {
            if (category[i].id === product[j].category) {
                category[i].count++
            }
        }
    }

    res.status(200).send(category)

})
app.post('/category', (req, res) => {
    const user = JSON.parse(fs.readFileSync('./data.json', "utf-8"))
    var bolion = true
    user.map(item => {
        if (item.title === req.body.title) {
            bolion = false
        }
    })
    var data = {
        "id": uuid.v1(),
        "text": req.body.text,
        "title": req.body.title,
        "count": 0
    }
    if (bolion) {
        user.unshift(data)
        fs.writeFileSync("./data.json", JSON.stringify(user, 0, 2), "utf-8")
        res.status(200).send("Ok")
    } else {
        res.status(403).send("Boshqa nom o`ylab toping")

    }
})
app.delete('/category/:id',autificationToken, (req, res) => {
    const User = JSON.parse(fs.readFileSync('./data.json', "utf-8"))
    User.map((item, key) => {
        if (item.id === req.params.id) {
            User.splice(key, 1)
        }
    })
    fs.writeFileSync("./data.json", JSON.stringify(User, 0, 2), "utf-8")
    res.status(200).send("Ok")
})
app.put('/category/:id',autificationToken, (req, res) => {
    const User = JSON.parse(fs.readFileSync('./data.json', "utf-8"))
    var id = req.params.id
    User.map((item, key) => {
        if (item.id === req.params.id) {
            item.text = req.body.text ? req.body.text : item.text
            item.title = req.body.title ? req.body.title : item.title
        }
    })
    fs.writeFileSync("./data.json", JSON.stringify(User, 0, 2), "utf-8")
    res.status(200).send("Ok")

})

app.get('/product/:name', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./product.json', "utf-8"))

    var sel = []
    User.map(item => {
        if (item.category==req.params.name) {
            sel.push(item)
        }
    })
    const zadacha = JSON.parse(fs.readFileSync('./zadacha.json', "utf-8"))
    for (let i = 0; i < sel.length; i++) {
        for (let j = 0; j < zadacha.length; j++) {
            if (sel[i].id=== zadacha[j].category) {
                sel[i].count++
            }
        }
    }

    res.status(200).send(sel)
})
app.post('/product', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./product.json', "utf-8"))

    var bolion = true
    User.map(item => {
        if (item.title === req.body.title) {
            bolion = false
        }
    })
    var data = {
        "id": uuid.v1(),
        "text": req.body.text,
        "title": req.body.title,
        "category": req.body.category,
        "count": 0
    }
    if (bolion) {
        User.unshift(data)
        fs.writeFileSync("./product.json", JSON.stringify(User, 0, 2), "utf-8")
        res.status(200).send("Ok")
    } else {
        res.status(403).send("Boshqa nom o`ylab toping")

    }
})
app.delete('/product/:id', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./product.json', "utf-8"))
    User.map((item, key) => {
        if (item.id === req.params.id) {
            User.splice(key, 1)
        }
    })
    fs.writeFileSync("./product.json", JSON.stringify(User, 0, 2), "utf-8")
    res.status(200).send("Ok")
})
app.put('/product/:id', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./product.json', "utf-8"))
    User.map((item, key) => {
        if (item.id === req.params.id) {
            item.text = req.body.text ? req.body.text : item.text
            item.title = req.body.title ? req.body.title : item.title
            item.category = req.body.category ? req.body.category : item.category
        }
    })
    fs.writeFileSync("./product.json", JSON.stringify(User, 0, 2), "utf-8")
    res.status(200).send("Ok")

})

app.get('/zadacha/:name', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./zadacha.json', "utf-8"))

    var sel = []
    User.map(item => {
        if (item.category == req.params.name) {
            sel.push(item)
        }
    })
    const subzadacha = JSON.parse(fs.readFileSync('./subzadacha.json', "utf-8"))
    for (let i = 0; i < sel.length; i++) {
        for (let j = 0; j < subzadacha.length; j++) {
            if (sel[i].id === subzadacha[j].category) {
                sel[i].count++
            }
        }
    }

    res.status(200).send(sel)
})
app.post('/zadacha', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./zadacha.json', "utf-8"))

    var bolion = true
    User.map(item => {
        if (item.title === req.body.title) {
            bolion = false
        }
    })
    var data = {
        "id": uuid.v1(),
        "text": req.body.text,
        "title": req.body.title,
        "category": req.body.category,
        "count": 0
    }
    if (bolion) {
        User.unshift(data)
        fs.writeFileSync("./zadacha.json", JSON.stringify(User, 0, 2), "utf-8")
        res.status(200).send("Ok")
    } else {
        res.status(403).send("Boshqa nom o`ylab toping")

    }
})
app.delete('/zadacha/:id', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./zadacha.json', "utf-8"))
    User.map((item, key) => {
        if (item.id === req.params.id) {
            User.splice(key, 1)
        }
    })
    fs.writeFileSync("./zadacha.json", JSON.stringify(User, 0, 2), "utf-8")
    res.status(200).send("Ok")
})
app.put('/zadacha/:id', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./zadacha.json', "utf-8"))
    User.map((item, key) => {
        if (item.id === req.params.id) {
            item.text = req.body.text ? req.body.text : item.text
            item.title = req.body.title ? req.body.title : item.title
            item.category = req.body.category ? req.body.category : item.category
        }
    })
    fs.writeFileSync("./zadacha.json", JSON.stringify(User, 0, 2), "utf-8")
    res.status(200).send("Ok")

})


app.get('/subzadacha/:name', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./subzadacha.json', "utf-8"))
     var sel = []
    User.map(item => {
        if (item.category == req.params.name) {
            sel.push(item)
        }
    })
   
    res.status(200).send(sel)
})
app.post('/subzadacha', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./subzadacha.json', "utf-8"))

    var bolion = true
    User.map(item => {
        if (item.title === req.body.title) {
            bolion = false
        }
    })
    var data = {
        "id": uuid.v1(),
        "text": req.body.text,
        "title": req.body.title,
        "category": req.body.category,
    }
    if (bolion) {
        User.unshift(data)
        fs.writeFileSync("./subzadacha.json", JSON.stringify(User, 0, 2), "utf-8")
        res.status(200).send("Ok")
    } else {
        res.status(403).send("Boshqa nom o`ylab toping")

    }
})
app.delete('/subzadacha/:id', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./subzadacha.json', "utf-8"))
    User.map((item, key) => {
        if (item.id === req.params.id) {
            User.splice(key, 1)
        }
    })
    fs.writeFileSync("./subzadacha.json", JSON.stringify(User, 0, 2), "utf-8")
    res.status(200).send("Ok")
})
app.put('/subzadacha/:id', (req, res) => {
    const User = JSON.parse(fs.readFileSync('./subzadacha.json', "utf-8"))
    User.map((item, key) => {
        if (item.id === req.params.id) {
            item.text = req.body.text ? req.body.text : item.text
            item.title = req.body.title ? req.body.title : item.title
            item.category = req.body.category ? req.body.category : item.category
        }
    })
    fs.writeFileSync("./subzadacha.json", JSON.stringify(User, 0, 2), "utf-8")
    res.status(200).send("Ok")

})







app.listen(5000, function () {
    console.log('Listening to Port 5000');
});
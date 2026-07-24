const express = require('express')
const cookieParsar = require('cookie-parser')

const app = express()
app.use(express.json())
app.use(cookieParsar())


//routes
const authRouter = require("./routes/auth.route")
const accountRouter = require("./routes/account.routes")
const transactionRutes = require("./routes/transaction.route")

// use route
app.use("/api/auth",authRouter)
app.use("/api/accounts",accountRouter)
app.use("/api/transactions",transactionRutes)

//for testing
app.get("/",(req,res)=>{
    res.status(200).json({
        message:"Welcome to ledger app"
    })
})

module.exports = app
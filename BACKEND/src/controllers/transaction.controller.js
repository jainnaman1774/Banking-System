const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");


// CREATE NORMAL TRANSACTION
async function createTransaction(req, res) {

    const {
        fromAccount,
        toAccount,
        amount,
        idempotencyKey
    } = req.body;


    // STEP 1: Validate request data
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required"
        });
    }


    let session;
    let transaction;


    try {

        // STEP 2: Find sender and receiver accounts
        const fromUserAccount = await accountModel.findById(fromAccount);

        const toUserAccount = await accountModel.findById(toAccount);


        if (!fromUserAccount || !toUserAccount) {
            return res.status(400).json({
                message: "Invalid fromAccount or toAccount"
            });
        }



        // STEP 3: Check duplicate transaction
        const existingTransaction = await transactionModel.findOne({
            idempotencyKey
        });


        if (existingTransaction) {

            return res.status(200).json({
                message: "Transaction already exists",
                transaction: existingTransaction
            });

        }



        // STEP 4: Check account status
        if (
            fromUserAccount.status !== "ACTIVE" ||
            toUserAccount.status !== "ACTIVE"
        ) {

            return res.status(400).json({
                message: "Both accounts must be ACTIVE"
            });

        }



        // STEP 5: Check balance
        const balance = await fromUserAccount.getBalance();


        if (balance < amount) {

            return res.status(400).json({
                message: `Insufficient balance. Current balance is ${balance}`
            });

        }




        // STEP 6: Start database transaction
        session = await mongoose.startSession();

        session.startTransaction();



        // STEP 7: Create transaction record as PENDING
        transaction = await transactionModel.create(
            [
                {
                    fromAccount,
                    toAccount,
                    amount,
                    idempotencyKey,
                    status: "PENDING"
                }
            ],
            {
                session
            }
        );


        transaction = transaction[0];





        // STEP 8: Create debit ledger entry

        await ledgerModel.create(
            [
                {
                    account: fromAccount,
                    amount,
                    transaction: transaction._id,
                    type: "DEBIT"
                }
            ],
            {
                session
            }
        );





        // STEP 9: Create credit ledger entry

        await ledgerModel.create(
            [
                {
                    account: toAccount,
                    amount,
                    transaction: transaction._id,
                    type: "CREDIT"
                }
            ],
            {
                session
            }
        );





        // STEP 10: Complete transaction

        transaction.status = "COMPLETED";


        await transaction.save({
            session
        });



        await session.commitTransaction();

        session.endSession();





        // Send email after successful transaction

        await emailService.sendTransactionEmail(
            req.user.email,
            req.user.name,
            amount,
            toAccount
        );




        return res.status(201).json({

            message: "Transaction completed successfully",

            transaction

        });



    } catch (error) {


        console.error(error);



        if (session) {

            await session.abortTransaction();

            session.endSession();

        }



        return res.status(500).json({

            message: "Transaction failed"

        });

    }

}





// CREATE INITIAL FUND TRANSACTION

async function createInitialFundTransaction(req, res) {


    const {
        toAccount,
        amount,
        idempotencyKey
    } = req.body;



    if (!toAccount || !amount || !idempotencyKey) {

        return res.status(400).json({

            message: "toAccount, amount and idempotencyKey are required"

        });

    }



    let session;



    try {


        const toUserAccount = await accountModel.findById(toAccount);



        if (!toUserAccount) {

            return res.status(400).json({

                message: "Invalid toAccount"

            });

        }



        const fromUserAccount = await accountModel.findOne({

            user: req.user._id

        });



        if (!fromUserAccount) {

            return res.status(400).json({

                message: "System account not found"

            });

        }





        const existingTransaction = await transactionModel.findOne({

            idempotencyKey

        });



        if (existingTransaction) {

            return res.status(200).json({

                message: "Transaction already exists",

                transaction: existingTransaction

            });

        }





        session = await mongoose.startSession();

        session.startTransaction();





        const transaction = new transactionModel({

            fromAccount: fromUserAccount._id,

            toAccount,

            amount,

            idempotencyKey,

            status: "PENDING"

        });




        await transaction.save({

            session

        });





        await ledgerModel.create(

            [
                {
                    account: fromUserAccount._id,
                    amount,
                    transaction: transaction._id,
                    type: "DEBIT"
                },
                {
                    account: toAccount,
                    amount,
                    transaction: transaction._id,
                    type: "CREDIT"
                }
            ],

            {
                session
            }

        );





        transaction.status = "COMPLETED";


        await transaction.save({

            session

        });





        await session.commitTransaction();


        session.endSession();





        return res.status(201).json({

            message: "Initial funds transaction completed successfully",

            transaction

        });




    } catch(error) {


        console.error(error);



        if(session){

            await session.abortTransaction();

            session.endSession();

        }



        return res.status(500).json({

            message:"Internal Server Error"

        });

    }

}





module.exports = {

    createTransaction,

    createInitialFundTransaction

};
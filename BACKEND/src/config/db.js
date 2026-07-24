// const momgoose = require('mongoose')

// function connectToDB(){
//     mongoose.connect(process.env.MONGO_URI)
//     .then(()=>{
//             console.log("Connected to DB")
//         }
//         .catch(err => {
//             console.log("Error connecting to DB")
//             process.exit(1)
//         })
    
//     )
// }

// module.exports = connectToDB()

const mongoose = require('mongoose');

function connectToDB() {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('Connected to DB');
        })
        .catch(err => {
            console.error('Error connecting to DB:', err);
            process.exit(1);
        });
}

module.exports = connectToDB;
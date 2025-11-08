const mongoose = require('mongoose')

async function main() {
    await mongoose.connect('mongodb+srv://Vinicius:1235899@cluster0.8wi1zqx.mongodb.net/')
    console.log('Conectado ao banco de dados');
}

main().catch((err) => {
    console.log(err);
})

module.exports = mongoose
const mongoose = require('mongoose')

async function main() {
    await mongoose.connect('mongodb://localhost:27017/g04-pi4')
    console.log('Conectado ao banco de dados');
}

main().catch((err) => {
    console.log(err);
})

module.exports = mongoose
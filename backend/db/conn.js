const mongoose = require('mongoose')

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("ERRO: DATABASE_URL não definida no .env");
}

async function main() {
    await mongoose.connect(dbUrl    )
    console.log('Conectado ao banco de dados');
}

main().catch((err) => {
    console.log(err);
})

module.exports = mongoose
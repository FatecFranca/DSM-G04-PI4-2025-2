const validarEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validarCPF = (cpf) => {
    if (!cpf) return false;

    const cpfLimpo = String(cpf).replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
        return false;
    }

    if (/^(\d)\1+$/.test(cpfLimpo)) {
        return false;
    }

    return true;
};


module.exports = { validarEmail, validarCPF };
const checkRole = (cargosPermitidos) => {
    return (req, res, next) => {
        const cargoDoUsuario = req.user.cargo;

        if (cargosPermitidos.includes(cargoDoUsuario)) {
            next();
        } else {
            res.status(403).json({ message: 'Acesso proibido. Você não tem a permissão necessária.' });
        }
    };
};

module.exports = checkRole;
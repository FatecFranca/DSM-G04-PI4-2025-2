const getUserToken = (req) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    throw new Error("Nenhum token recebido");
  }
  const parts = authorization.split(" ");
  return parts[1];
};

module.exports = getUserToken;

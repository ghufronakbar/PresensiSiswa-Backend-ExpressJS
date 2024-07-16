const jwt = require("jsonwebtoken");
const petugasVerification = (req, res, next) => {
  let token = req.headers["authorization"];
  
  if (token) {    
    token = token.replace(/^Bearer\s+/, "");

    // Verifikasi token
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        return res.status(401).send({ auth: false, message: "Token tidak terdaftar!" });
      } else {
        // Cek waktu kadaluarsa token
        
        const currentTime = Math.floor(Date.now() / 1000); // Waktu saat ini dalam detik

        if (decoded.exp && decoded.exp < currentTime) {
          return res.status(401).send({ auth: false, message: "Sesi telah kadaluarsa!" });
        }

        if(!decoded.idPetugas){
          return res.status(401).send({ auth: false, message: "Anda bukan petugas" });
        }
        
        req.decoded = decoded; // Menyimpan data decoded ke dalam req untuk penggunaan selanjutnya

        next(); // Lanjutkan ke middleware/route selanjutnya
      }
    });
  } else {
    return res.status(401).send({ auth: false, message: "Token tidak tersedia!" });
  }
}

module.exports = petugasVerification;

const prisma = require('../../db/prisma')
const md5 = require('md5')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        if (!email || !password) { return res.status(400).json({ status: 400, message: 'Email dan password harus diisi' }) }

        const petugas = await prisma.petugas.findFirst({
            where: {
                email
            }
        })
        if (!petugas) { return res.status(404).json({ status: 404, message: 'Anda bukan petugas' }) }

        if (petugas.password !== md5(password)) { return res.status(400).json({ status: 400, message: 'Password salah' }) }

        const token = jwt.sign({ idPetugas: petugas.idPetugas }, process.env.JWT_SECRET, { expiresIn: '1h' })

        return res.status(200).json({ status: 200, message: 'Login success', data: petugas, token })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })

    }
}

const profile = async (req, res) => {
    const { idPetugas } = req.decoded
    try {
        const getProfile = await prisma.petugas.findFirst({
            where: {
                idPetugas
            }
        })

        return res.status(200).json({ status: 200, message: 'Profile success', data: getProfile })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const editPassword = async (req, res) => {
    const { idPetugas } = req.decoded
    const { old_password, new_password, confirmation_password } = req.body
    try {
        if (new_password !== confirmation_password) { return res.status(400).json({ status: 400, message: 'Konfirmasi password baru tidak sesuai' }) }

        if (new_password.length < 8) { return res.status(400).json({ status: 400, message: 'Password minimal 8 karakter' }) }

        const petugas = await prisma.petugas.findFirst({
            where: {
                idPetugas
            }
        })

        if (petugas.password !== md5(old_password)) { return res.status(400).json({ status: 400, message: 'Password lama tidak sesuai' }) }

        await prisma.petugas.update({
            where: {
                idPetugas
            },
            data: {
                password: md5(new_password)
            }
        })

        return res.status(200).json({ status: 200, message: 'Password berhasil diubah' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const editProfile = async (req, res) => {
    const { idPetugas } = req.decoded
    const { nama, email } = req.body    
    try {
        if (!email) { return res.status(400).json({ status: 400, message: 'Email harus diisi' }) }
        if (!nama) { return res.status(400).json({ status: 400, message: 'Nama harus diisi' }) }

        const validateEmail = await prisma.petugas.findFirst({
            where: {
                email,
                idPetugas: { not: idPetugas }
            }
        })

        if (validateEmail) { return res.status(400).json({ status: 400, message: 'Email sudah terdaftar' }) }

        await prisma.petugas.update({
            where: {
                idPetugas
            },
            data: {
                nama,
                email
            }
        })

        return res.status(200).json({ status: 200, message: 'Profile berhasil diubah' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

module.exports = { login, profile, editPassword, editProfile }
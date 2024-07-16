const primsa = require('../../db/prisma')
const md5 = require('md5')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        if (!email || !password) { return res.status(400).json({ status: 400, message: 'Email dan password harus diisi' }) }

        const admin = await primsa.admin.findFirst({
            where: {
                email
            }
        })
        if (!admin) { return res.status(404).json({ status: 404, message: 'Anda bukan admin' }) }

        if (admin.password !== md5(password)) { return res.status(400).json({ status: 400, message: 'Password salah' }) }

        const token = jwt.sign({ idAdmin: admin.idAdmin, isSuperAdmin: admin.isSuperAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' })

        return res.status(200).json({ status: 200, message: 'Login success', data: admin, token })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })

    }
}

const profile = async (req, res) => {
    const { idAdmin } = req.decoded
    try {
        const getProfile = await primsa.admin.findFirst({
            where: {
                idAdmin
            }
        })

        return res.status(200).json({ status: 200, message: 'Profile success', data: getProfile })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: "Internal Server Error" })
    }
}

const editPassword = async (req, res) => {
    const { idAdmin } = req.decoded
    const { old_password, new_password, confirmation_password } = req.body
    try {
        if (new_password !== confirmation_password) { return res.status(400).json({ status: 400, message: 'Konfirmasi password baru tidak sesuai' }) }

        if (new_password.length < 8) { return res.status(400).json({ status: 400, message: 'Password minimal 8 karakter' }) }

        const admin = await primsa.admin.findFirst({
            where: {
                idAdmin
            }
        })

        if (admin.password !== md5(old_password)) { return res.status(400).json({ status: 400, message: 'Password lama tidak sesuai' }) }

        await primsa.admin.update({
            where: {
                idAdmin
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

module.exports = { login, profile, editPassword }
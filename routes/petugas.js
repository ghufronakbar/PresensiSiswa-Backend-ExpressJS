const express = require('express');
const router = express.Router();

const petugasVerification = require('../middleware/petugasVerification');
const { login, profile, editPassword, editProfile } = require('../controllers/petugas/account')
const { doPresensi } = require('../controllers/petugas/presensi')

// ACCOUNT
router.post('/login', login)
router.get('/profile', petugasVerification, profile)
router.put('/password', petugasVerification, editPassword)
router.put('/profile', petugasVerification, editProfile)

//PRESENSI
router.post('/presensi', petugasVerification, doPresensi)

module.exports = router
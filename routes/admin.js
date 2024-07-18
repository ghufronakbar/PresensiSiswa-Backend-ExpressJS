const express = require('express');
const router = express.Router();

const adminVerification = require('../middleware/adminVerification');
const { login, profile, editPassword } = require('../controllers/admin/account')
const { showAdmin, showAdminId, createAdmin, deleteAdmin } = require('../controllers/admin/management')
const { createPetugas, deletePetugas, showPetugas, showPetugasId } = require('../controllers/admin/petugas')
const { showSiswa, createSiswa, showSiswaId, deleteSiswa, editSiswa } = require('../controllers/admin/siswa')
const { showPresensi, editPresensi, makeAllPresensiHadir } = require('../controllers/admin/presensi')
const { showKelas } = require('../controllers/admin/kelas');
const { dashboard } = require('../controllers/admin/dashboard');
const { getInformasi, editInformasi } = require('../controllers/admin/informasi');

// ACCOUNT
router.post('/login', login)
router.get('/profile', adminVerification, profile)
router.put('/password', adminVerification, editPassword)

// MANAGEMENT
router.get('/management', adminVerification, showAdmin)
router.get('/management/:id', adminVerification, showAdminId)
router.post('/management', adminVerification, createAdmin)
router.delete('/management/:id', adminVerification, deleteAdmin)

// PETUGAS
router.get('/petugas', adminVerification, showPetugas)
router.get('/petugas/:id', adminVerification, showPetugasId)
router.post('/petugas', adminVerification, createPetugas)
router.delete('/petugas/:id', adminVerification, deletePetugas)

// SISWA
router.get('/siswa', adminVerification, showSiswa)
router.get('/siswa/:id', adminVerification, showSiswaId)
router.post('/siswa', adminVerification, createSiswa)
router.put('/siswa/:id', adminVerification, editSiswa)
router.delete('/siswa/:id', adminVerification, deleteSiswa)

// PRESENSI
router.get('/presensi', adminVerification, showPresensi)
router.put('/presensi/:id', adminVerification, editPresensi)
router.post('/presensi', adminVerification, makeAllPresensiHadir)

// KELAS
router.get('/kelas', adminVerification, showKelas)

// DASHBOARD
router.get('/dashboard', adminVerification, dashboard)

// INFORMASI
router.get('/informasi', adminVerification, getInformasi)
router.put('/informasi', adminVerification, editInformasi)

module.exports = router
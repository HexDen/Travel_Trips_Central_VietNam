const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

function createToken(user){
  return jwt.sign(
    { userId: user._id.toString(), role: user.role || 'user' },
    process.env.JWT_SECRET || 'development-secret',
    { expiresIn: '7d' }
  )
}

function publicUser(user){
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    interests: user.interests || [],
    role: user.role || 'user',
    avatar: user.avatar || '',
    bio: user.bio || '',
    points: user.points || 0,
    completed_trips: user.completed_trips || 0
  }
}

// Hàm tự động khởi tạo tài khoản Quản trị viên (Admin Seed) an toàn vào CSDL MongoDB
async function ensureAdminExists() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@traveltrips.vn').toLowerCase()
    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { email: 'admin' }, { role: 'admin' }]
    })

    if (!existingAdmin) {
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123'
      const password_hash = await bcrypt.hash(defaultPassword, 12)
      await User.create({
        name: 'Hệ thống Quản trị',
        email: adminEmail,
        password_hash,
        role: 'admin'
      })
      console.log(`🛡️ [AUTH] Đã tự động khởi tạo tài khoản Quản trị viên MongoDB: ${adminEmail} (Role: admin)`)
    }
  } catch (err) {
    console.warn('⚠️ [AUTH] Thông báo khởi tạo tài khoản admin:', err.message)
  }
}

router.post('/register', async (req, res) => {
  try{
    const { name, email, password } = req.body
    if(!name || !email || !password || password.length < 6){
      return res.status(400).json({ error: 'Tên, email và mật khẩu tối thiểu 6 ký tự là bắt buộc' })
    }
    const normalizedEmail = email.trim().toLowerCase()
    if(await User.findOne({ email: normalizedEmail })) return res.status(409).json({ error: 'Email đã được đăng ký' })
    const password_hash = await bcrypt.hash(password, 12)
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password_hash, role: 'user' })
    res.status(201).json({ token: createToken(user), user: publicUser(user) })
  }catch(err){
    res.status(500).json({ error: err.message || 'Không thể đăng ký' })
  }
})

router.post('/login', async (req, res) => {
  try{
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' })
    }

    const inputEmail = String(email).trim().toLowerCase()
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@traveltrips.vn').toLowerCase()

    // Tìm kiếm người dùng theo email chuẩn, hoặc bí danh 'admin'
    const user = await User.findOne({
      $or: [
        { email: inputEmail },
        { email: inputEmail === 'admin' ? adminEmail : inputEmail }
      ]
    })

    if(!user || !(await bcrypt.compare(password, user.password_hash))){
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
    }

    res.json({ token: createToken(user), user: publicUser(user) })
  }catch(err){
    res.status(500).json({ error: err.message || 'Không thể đăng nhập' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password_hash')
    if(!user) return res.status(404).json({ error: 'Người dùng không tồn tại' })
    res.json(publicUser(user))
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xác thực người dùng' })
  }
})

router.put('/update-profile', requireAuth, async (req, res) => {
  try {
    const { name, avatar, bio, interests } = req.body
    const updates = {}
    if (name) updates.name = name.trim()
    if (avatar !== undefined) updates.avatar = avatar
    if (bio !== undefined) updates.bio = bio
    if (interests && Array.isArray(interests)) updates.interests = interests
    
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true })
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' })
    res.json(publicUser(user))
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật hồ sơ' })
  }
})

module.exports = router
module.exports.ensureAdminExists = ensureAdminExists

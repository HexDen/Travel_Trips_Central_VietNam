const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { requireAuth } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })

const router = express.Router()

function createToken(user){
  return jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || 'development-secret', { expiresIn: '7d' })
}

function publicUser(user){
  return { 
    id: user._id, 
    name: user.name, 
    email: user.email, 
    interests: user.interests || [],
    avatar: user.avatar || '',
    bio: user.bio || '',
    phone: user.phone || '',
    level: user.level || 'Thành viên mới'
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
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password_hash })
    res.status(201).json({ token: createToken(user), user: publicUser(user) })
  }catch(err){
    res.status(500).json({ error: err.message || 'Không thể đăng ký' })
  }
})

router.post('/login', async (req, res) => {
  try{
    const { email, password } = req.body
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() })
    if(!user || !(await bcrypt.compare(password || '', user.password_hash))){
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
    }
    res.json({ token: createToken(user), user: publicUser(user) })
  }catch(err){
    res.status(500).json({ error: err.message || 'Không thể đăng nhập' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('-password_hash')
  if(!user) return res.status(404).json({ error: 'Người dùng không tồn tại' })
  res.json(publicUser(user))
})

router.put('/profile', requireAuth, upload.single('avatarFile'), async (req, res) => {
  try {
    const { name, bio, phone, interests } = req.body
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' })
    
    if (name !== undefined) user.name = name.trim()
    if (bio !== undefined) user.bio = bio.trim()
    if (phone !== undefined) user.phone = phone.trim()
    if (interests !== undefined) {
      // interests could be a string if sent via FormData, so we try to parse it
      try {
        user.interests = typeof interests === 'string' ? JSON.parse(interests) : interests
      } catch(e) {
        user.interests = Array.isArray(interests) ? interests : []
      }
    }
    
    // Nếu user tải file lên, cập nhật đường dẫn ảnh
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`
    } else if (req.body.avatar !== undefined) {
      // Nếu user gửi link URL
      user.avatar = req.body.avatar.trim()
    }
    
    await user.save()
    res.json({ message: 'Cập nhật hồ sơ thành công', user: publicUser(user) })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Lỗi khi cập nhật hồ sơ' })
  }
})

module.exports = router

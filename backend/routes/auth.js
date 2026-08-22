const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

function createToken(user){
  return jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || 'development-secret', { expiresIn: '7d' })
}

function publicUser(user){
  return { id: user._id, name: user.name, email: user.email, interests: user.interests || [] }
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

module.exports = router

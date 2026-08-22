const jwt = require('jsonwebtoken')

function requireAuth(req, res, next){
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if(!token) return res.status(401).json({ error: 'Cần đăng nhập' })

  try{
    req.userId = jwt.verify(token, process.env.JWT_SECRET || 'development-secret').userId
    next()
  }catch(err){
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

function optionalAuth(req, res, next){
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if(token){
    try{ req.userId = jwt.verify(token, process.env.JWT_SECRET || 'development-secret').userId }catch(err){}
  }
  next()
}

module.exports = { requireAuth, optionalAuth }

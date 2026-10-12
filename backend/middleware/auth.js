const jwt = require('jsonwebtoken')

function requireAuth(req, res, next){
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if(!token) return res.status(401).json({ error: 'Cần đăng nhập' })

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret')
    req.userId = decoded.userId
    req.userRole = decoded.role || 'user'
    next()
  }catch(err){
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

function requireAdmin(req, res, next){
  requireAuth(req, res, () => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Quyền truy cập bị từ chối: Yêu cầu quyền Quản trị viên' })
    }
    next()
  })
}

function optionalAuth(req, res, next){
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if(token){
    try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret')
      req.userId = decoded.userId
      req.userRole = decoded.role || 'user'
    }catch(err){}
  }
  next()
}

module.exports = { requireAuth, requireAdmin, optionalAuth }

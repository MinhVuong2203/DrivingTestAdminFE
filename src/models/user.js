export class VipUser {
  constructor(data = {}) {
    this.name = data.name || ''
    this.startDate = data.startDate || null
    this.endDate = data.endDate || null
  }
}

export class User {
  constructor(data = {}) {
    this.uid = data.uid || ''
    this.displayName = data.displayName || ''
    this.email = data.email || ''
    this.role = data.role || ''
    this.status = data.status || ''
    this.unlockAt = data.unlockAt || null
    this.photoURL = data.photoURL || ''
    this.createdAt = data.createdAt || null
    this.vipUser = data.vipUser || null
  }
}

const fs = require('fs');
let mergedCode = fs.readFileSync('frontend/src/App.vue', 'utf8');

const jsLogic = `
// --- TRIPS LOGIC INJECTED ---
const selectedTrips = ref([])
const isSelectAllTrips = computed(() => myTripsList.value.length > 0 && selectedTrips.value.length === myTripsList.value.length)

function toggleTripSelection(id) {
  const idx = selectedTrips.value.indexOf(id)
  if (idx > -1) selectedTrips.value.splice(idx, 1)
  else selectedTrips.value.push(id)
}

function toggleSelectAllTrips() {
  if (isSelectAllTrips.value) {
    selectedTrips.value = []
  } else {
    selectedTrips.value = myTripsList.value.map(t => t._id)
  }
}

function promptDeleteSelected() {
  if (!selectedTrips.value.length) return
  deleteTarget.value = 'selected'
  modalDeleteVisible.value = true
}

function promptDeleteTrip(trip) {
  if (trip === 'all') {
    deleteTarget.value = 'all'
  } else {
    deleteTarget.value = trip
  }
  modalDeleteVisible.value = true
}

async function executeDeleteTrips() {
  try {
    let idsToDelete = []
    if (deleteTarget.value === 'all') {
      idsToDelete = myTripsList.value.map(t => t._id)
    } else if (deleteTarget.value === 'selected') {
      idsToDelete = [...selectedTrips.value]
    } else if (deleteTarget.value?._id) {
      idsToDelete = [deleteTarget.value._id]
    }

    if (!idsToDelete.length) return

    await api.post('/trips/delete-multiple', { tripIds: idsToDelete })
    
    // Xóa khỏi UI
    myTripsList.value = myTripsList.value.filter(t => !idsToDelete.includes(t._id))
    selectedTrips.value = []
    modalDeleteVisible.value = false
    deleteTarget.value = null
    
    if (xemTripChiTiet.value && idsToDelete.includes(xemTripChiTiet.value._id)) {
      xemTripChiTiet.value = null
      hienModalChiTietTrip.value = false
    }
  } catch (err) {
    console.error('Lỗi xóa chuyến đi:', err)
    alert('Không thể xóa chuyến đi. Vui lòng thử lại.')
  }
}

// --- PROFILE LOGIC INJECTED ---
const isEditingProfile = ref(false)
const profileForm = reactive({
  name: '',
  bio: '',
  avatar: ''
})

const userStats = computed(() => {
  return {
    points: nguoiDung.value?.points || 0,
    completedTrips: nguoiDung.value?.completed_trips || 0,
    savedTrips: myTripsList.value?.length || 0,
    favoritePlaces: favoritesList.value?.length || 0
  }
})

function editProfile() {
  profileForm.name = nguoiDung.value?.name || ''
  profileForm.bio = nguoiDung.value?.bio || ''
  profileForm.avatar = nguoiDung.value?.avatar || ''
  isEditingProfile.value = true
}

function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('Kích thước ảnh tối đa 2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    profileForm.avatar = event.target.result
  }
  reader.readAsDataURL(file)
}

async function saveProfile() {
  try {
    const res = await api.put('/auth/update-profile', {
      name: profileForm.name,
      bio: profileForm.bio,
      avatar: profileForm.avatar
    })
    nguoiDung.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
    isEditingProfile.value = false
  } catch (err) {
    console.error('Lỗi cập nhật hồ sơ:', err)
    alert(err.response?.data?.error || 'Không thể cập nhật hồ sơ')
  }
}

`;

mergedCode = mergedCode.replace(/onMounted\(\s*async\s*\(\)\s*=>\s*\{/, jsLogic + '\n\nonMounted(async () => {');

// We also need to fix `xoaChuyenDi` which is Nam's function. Since we are using executeDeleteTrips, we need to ensure executeDeleteTrips replaces xoaChuyenDi logic in the template.
// Wait, we REPLACED the HTML for My Trips earlier in `merge_profile.js`, so the template ALREADY calls `promptDeleteTrip(trip)` instead of `xoaChuyenDi(trip)`!
// Let's verify if `modalDeleteVisible` and `deleteTarget` are declared.
if (!mergedCode.includes('const modalDeleteVisible = ref(false)')) {
  mergedCode = mergedCode.replace(/const dangTao = ref\(false\)/, 'const dangTao = ref(false)\nconst modalDeleteVisible = ref(false)\nconst deleteTarget = ref(null)');
}

fs.writeFileSync('frontend/src/App.vue', mergedCode);
console.log('Merge JS complete!');

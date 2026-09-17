const axios = require('axios');

function getGoogleMapsKey() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || key === 'your_google_maps_api_key_here') return null;
  return key;
}

/**
 * Lấy URL hình ảnh chân thực từ Google Maps cho một địa điểm cụ thể
 * @param {string} placeName Tên địa điểm (VD: "Bà Nà Hills")
 * @param {string} destination Tên tỉnh/thành phố (VD: "Đà Nẵng")
 * @returns {Promise<string|null>} Trả về URL hình ảnh hoặc null nếu không tìm thấy
 */
async function getRealImageFromGoogleMaps(placeName, destination) {
  const apiKey = getGoogleMapsKey();
  if (!apiKey) return null;

  try {
    const query = `${placeName} ${destination}`;
    // Gọi API Text Search để tìm địa điểm
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    
    const response = await axios.get(searchUrl);
    
    if (response.data && response.data.results && response.data.results.length > 0) {
      const place = response.data.results[0];
      
      // Nếu địa điểm có hình ảnh
      if (place.photos && place.photos.length > 0) {
        // Lấy hình ảnh đầu tiên hoặc hình ảnh phổ biến nhất
        const photoReference = place.photos[0].photo_reference;
        
        // Tạo URL trực tiếp đến hình ảnh
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${apiKey}`;
        return photoUrl;
      }
    }
    return null; // Không tìm thấy ảnh
  } catch (error) {
    console.warn(`[Google Maps Service] Lỗi khi lấy ảnh cho ${placeName} ở ${destination}: ${error.message}`);
    return null;
  }
}

module.exports = {
  getRealImageFromGoogleMaps,
  getGoogleMapsKey
};

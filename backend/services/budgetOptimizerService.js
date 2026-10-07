/**
 * budgetOptimizerService.js
 * Thuật toán tối ưu hóa lịch trình và phân bổ chi phí theo 5 tầng ngân sách (T0 -> T4)
 * Hỗ trợ từ gói phượt siêu tiết kiệm (1 - 2 triệu) đến gói nghỉ dưỡng xa hoa (30 triệu+)
 */

// 1. Định nghĩa 5 tầng ngân sách theo chi phí mỗi người / ngày (VND)
const TIER_DEFINITIONS = {
  T0: {
    key: 'T0',
    name: 'Sinh Tồn / Phượt Bụi',
    code: 'survival',
    icon: '🪨',
    badge: 'SIÊU TIẾT KIỆM',
    color: '#64748b',
    minPerDay: 0,
    maxPerDay: 250000,
    hotelDesc: 'Hostel dorm / Homestay cộng đồng / Couchsurfing',
    foodDesc: 'Quán ăn vỉa hè, bánh mì que, bánh bèo hẻm, bún bình dân',
    transportDesc: 'Xe khách ghế ngồi / Đi bộ / Xe đạp / Xe buýt nội đô',
    targetHotelNight: 150000,
    targetMealCost: 30000,
    targetTicketCost: 0, // Ưu tiên điểm miễn phí
    // Tỷ lệ phân bổ ngân sách
    ratios: { transport: 0.20, hotel: 0.20, food: 0.45, tickets: 0.05, reserve: 0.10 }
  },
  T1: {
    key: 'T1',
    name: 'Tiết Kiệm / Sinh Viên',
    code: 'budget',
    icon: '💚',
    badge: 'TIẾT KIỆM TỐI ƯU (1 - 2 TRIỆU)',
    color: '#10b981',
    minPerDay: 250000,
    maxPerDay: 600000,
    hotelDesc: 'Nhà nghỉ tiêu chuẩn / Phòng riêng homestay giá mềm',
    foodDesc: 'Mì Quảng, cơm gà bình dân, hải sản bình dân ven chợ',
    transportDesc: 'Xe khách giường nằm giá rẻ / Thuê xe máy vi vu',
    targetHotelNight: 280000,
    targetMealCost: 45000,
    targetTicketCost: 40000,
    ratios: { transport: 0.22, hotel: 0.28, food: 0.35, tickets: 0.08, reserve: 0.07 }
  },
  T2: {
    key: 'T2',
    name: 'Tiêu Chuẩn / Phổ Thông',
    code: 'standard',
    icon: '💙',
    badge: 'TIÊU CHUẨN THOẢI MÁI',
    color: '#0284c7',
    minPerDay: 600000,
    maxPerDay: 1500000,
    hotelDesc: 'Khách sạn 3 sao có ăn sáng / Khách sạn gần biển',
    foodDesc: 'Nhà hàng đặc sản, hải sản tươi sống, cafe view đẹp',
    transportDesc: 'Xe khách Limousine / Tàu hỏa ngắm cảnh / Thuê xe máy tốt',
    targetHotelNight: 650000,
    targetMealCost: 100000,
    targetTicketCost: 120000,
    ratios: { transport: 0.20, hotel: 0.35, food: 0.28, tickets: 0.12, reserve: 0.05 }
  },
  T3: {
    key: 'T3',
    name: 'Chất Lượng Cao / Trải Nghiệm',
    code: 'comfort',
    icon: '💜',
    badge: '4 SAO CAO CẤP',
    color: '#8b5cf6',
    minPerDay: 1500000,
    maxPerDay: 3500000,
    hotelDesc: 'Khách sạn 4 sao / Resort boutique / View biển hồ bơi vô cực',
    foodDesc: 'Nhà hàng hải sản lớn, lẩu hải sản, bar cocktail hoàng hôn',
    transportDesc: 'Vé máy bay khứ hồi / Thuê ô tô tự lái / Taxi trọn gói',
    targetHotelNight: 1600000,
    targetMealCost: 250000,
    targetTicketCost: 350000,
    ratios: { transport: 0.20, hotel: 0.40, food: 0.23, tickets: 0.12, reserve: 0.05 }
  },
  T4: {
    key: 'T4',
    name: 'Xa Hoa / VIP Nghỉ Dưỡng',
    code: 'luxury',
    icon: '🟡',
    badge: '5 SAO XA HOA (30 TRIỆU+)',
    color: '#f59e0b',
    minPerDay: 3500000,
    maxPerDay: Infinity,
    hotelDesc: 'Resort 5 sao quốc tế / Biệt thự biển riêng (InterContinental, Hyatt, Vinpearl)',
    foodDesc: 'Fine Dining, buffet tôm hùm 5 sao, ăn tối du thuyền lãng mạn',
    transportDesc: 'Vé máy bay hạng thương gia / Xe limousine riêng đưa đón',
    targetHotelNight: 4500000,
    targetMealCost: 750000,
    targetTicketCost: 950000, // Vé VIP Bà Nà Hills WOW Pass, tour cano riêng
    ratios: { transport: 0.15, hotel: 0.45, food: 0.23, tickets: 0.12, reserve: 0.05 }
  }
}

/**
 * Kiểm tra tính khả thi của chuyến đi (Feasibility Check)
 * Ngăn chặn các yêu cầu bất khả thi (VD: 500k đi 10 ngày 2 người)
 */
function checkTripFeasibility(totalBudget, numDays = 3, numPeople = 1, destination = 'Đà Nẵng', freePlacesOnly = false) {
  const safeBudget = Number(totalBudget) || 0
  const safeDays = Math.max(1, Number(numDays) || 1)
  const safePeople = Math.max(1, Number(numPeople) || 1)
  const perPersonPerDay = safeBudget / (safeDays * safePeople)

  // Mức chi phí tối thiểu sàn để có thể tồn tại (chỗ ở + ăn uống 3 bữa + đi lại cơ bản):
  // Đi trong ngày (1 ngày): tối thiểu 150.000đ/người (ăn 2 bữa + xăng xe máy, không phòng nghỉ)
  // Đi nhiều ngày (>1 ngày): tối thiểu 250.000đ/người/ngày (homestay/dorm tối thiểu ~120k/người + ăn 3 bữa ~100k + di chuyển ~30k)
  const minDailyPerPerson = safeDays === 1 ? 150000 : 250000
  const minFeasibleBudget = safeDays === 1 ? (safePeople * 150000) : (safeDays * safePeople * 250000)

  // Nếu người dùng chủ động chọn chế độ chỉ đi các điểm MIỄN PHÍ VÉ (Free Places Only)
  if (freePlacesOnly) {
    return {
      feasible: true,
      mode: 'free_places_only',
      perPersonPerDay: Math.round(perPersonPerDay),
      minFeasibleBudget,
      message: 'Chế độ tham quan 100% điểm miễn phí vé & tự túc lưu trú.'
    }
  }

  // Nếu ngân sách thấp hơn ngưỡng khả thi tối thiểu
  if (safeBudget < minFeasibleBudget) {
    const maxFeasibleDays = Math.max(1, Math.floor(safeBudget / (safePeople * 250000)))
    return {
      feasible: false,
      reason: 'INSUFFICIENT_BUDGET',
      budget: safeBudget,
      days: safeDays,
      people: safePeople,
      perPersonPerDay: Math.round(perPersonPerDay),
      minDailyPerPerson,
      minFeasibleBudget,
      maxFeasibleDays,
      message: `Ngân sách ${safeBudget.toLocaleString('vi-VN')}đ không khả thi cho chuyến đi ${safeDays} ngày ${safePeople} người tại ${destination} (trung bình chỉ ~${Math.round(perPersonPerDay).toLocaleString('vi-VN')}đ/người/ngày). Số tiền này không đủ để chi trả tiền phòng nghỉ tối thiểu (~150.000đ/đêm) và ăn uống 3 bữa mỗi ngày.`,
      recommendation: {
        minBudget: minFeasibleBudget,
        suggestedDays: maxFeasibleDays,
        advice: `Để chuyến đi có thể thực hiện được, bạn nên tăng ngân sách lên tối thiểu ${minFeasibleBudget.toLocaleString('vi-VN')}đ, hoặc rút ngắn chuyến đi xuống ${maxFeasibleDays} ngày, hoặc chọn chế độ chỉ tham quan các điểm 100% miễn phí.`
      }
    }
  }

  return {
    feasible: true,
    perPersonPerDay: Math.round(perPersonPerDay),
    minFeasibleBudget
  }
}

/**
 * Xác định tầng ngân sách dựa trên tổng tiền, số ngày, số người
 */
function classifyTier(totalBudget, numDays = 3, numPeople = 1) {
  const safeBudget = Math.max(100000, Number(totalBudget) || 3000000)
  const safeDays = Math.max(1, Number(numDays) || 3)
  const safePeople = Math.max(1, Number(numPeople) || 1)
  
  const perPersonPerDay = safeBudget / (safeDays * safePeople)

  // Trường hợp đặc biệt: nếu tổng ngân sách từ 20 triệu trở lên cho chuyến đi ngắn ngày -> ưu tiên xếp tầng Luxury
  if (safeBudget >= 20000000 && perPersonPerDay >= 2500000) {
    return TIER_DEFINITIONS.T4
  }

  if (perPersonPerDay < TIER_DEFINITIONS.T0.maxPerDay) return TIER_DEFINITIONS.T0
  if (perPersonPerDay < TIER_DEFINITIONS.T1.maxPerDay) return TIER_DEFINITIONS.T1
  if (perPersonPerDay < TIER_DEFINITIONS.T2.maxPerDay) return TIER_DEFINITIONS.T2
  if (perPersonPerDay < TIER_DEFINITIONS.T3.maxPerDay) return TIER_DEFINITIONS.T3
  return TIER_DEFINITIONS.T4
}

/**
 * Phân bổ ngân sách khoa học theo tỷ lệ của Tầng
 */
function optimizeBudgetAllocation(totalBudget, numDays = 3, numPeople = 1, actualTransitTotal = null, freePlacesOnly = false) {
  const safeBudget = Math.max(500000, Number(totalBudget) || 3000000)
  const safeDays = Math.max(1, Number(numDays) || 3)
  const safePeople = Math.max(1, Number(numPeople) || 1)
  const nights = Math.max(1, safeDays - 1)

  const feasibility = checkTripFeasibility(safeBudget, safeDays, safePeople, 'Đà Nẵng', freePlacesOnly)
  const tier = classifyTier(safeBudget, safeDays, safePeople)
  let ratios = { ...tier.ratios }

  // Nếu chọn chế độ chỉ đi các điểm MIỄN PHÍ VÉ (Free Places Only)
  if (freePlacesOnly) {
    const nonTicketSum = ratios.hotel + ratios.food + ratios.transport + ratios.reserve
    ratios = {
      hotel: Number((ratios.hotel / nonTicketSum).toFixed(4)),
      food: Number((ratios.food / nonTicketSum).toFixed(4)),
      transport: Number((ratios.transport / nonTicketSum).toFixed(4)),
      tickets: 0,
      reserve: Number((ratios.reserve / nonTicketSum).toFixed(4))
    }
  }

  let transportation = 0
  let remainingBudget = safeBudget

  // Nếu đã có giá vé xe thực tế được chọn từ busService
  if (actualTransitTotal && actualTransitTotal > 0 && actualTransitTotal < safeBudget * 0.5) {
    transportation = Math.round(actualTransitTotal)
    remainingBudget = Math.max(0, safeBudget - transportation)
    // Phân bổ lại phần còn lại cho các khoản còn lại
    const subRatioSum = ratios.hotel + ratios.food + ratios.tickets + ratios.reserve
    const hotel = Math.round(remainingBudget * (ratios.hotel / subRatioSum))
    const food = Math.round(remainingBudget * (ratios.food / subRatioSum))
    const tickets = freePlacesOnly ? 0 : Math.round(remainingBudget * (ratios.tickets / subRatioSum))
    const reserve = Math.max(0, safeBudget - (transportation + hotel + food + tickets))

    return {
      tier: tier.key,
      tierInfo: tier,
      feasibility,
      freePlacesOnly: Boolean(freePlacesOnly),
      totalBudget: safeBudget,
      perPersonPerDay: Math.round(safeBudget / (safeDays * safePeople)),
      breakdown: { hotel, food, transportation, tickets, reserve },
      perNightHotel: Math.round(hotel / nights),
      perDayFoodPerPerson: Math.round(food / (safeDays * safePeople)),
      hotelDesc: tier.hotelDesc,
      foodDesc: tier.foodDesc,
      transportDesc: tier.transportDesc
    }
  }

  // Phân bổ theo tỷ lệ chuẩn của Tầng
  const hotel = Math.round(safeBudget * ratios.hotel)
  const food = Math.round(safeBudget * ratios.food)
  transportation = Math.round(safeBudget * ratios.transport)
  const tickets = freePlacesOnly ? 0 : Math.round(safeBudget * ratios.tickets)
  const reserve = Math.max(0, safeBudget - (hotel + food + transportation + tickets))

  return {
    tier: tier.key,
    tierInfo: tier,
    feasibility,
    freePlacesOnly: Boolean(freePlacesOnly),
    totalBudget: safeBudget,
    perPersonPerDay: Math.round(safeBudget / (safeDays * safePeople)),
    breakdown: { hotel, food, transportation, tickets, reserve },
    perNightHotel: Math.round(hotel / nights),
    perDayFoodPerPerson: Math.round(food / (safeDays * safePeople)),
    hotelDesc: tier.hotelDesc,
    foodDesc: tier.foodDesc,
    transportDesc: tier.transportDesc
  }
}

/**
 * Đánh giá điểm số của 1 địa điểm trong Database theo phân tầng ngân sách
 * Score từ 0 -> 100 điểm
 */
function scorePlaceForBudget(place, tierKey = 'T1', clusterCenter = null, userInterests = [], freePlacesOnly = false) {
  if (!place) return 50
  const tier = TIER_DEFINITIONS[tierKey] || TIER_DEFINITIONS.T1
  const cost = Number(place.estimated_cost) || 0
  const type = place.type || 'attraction'
  const rating = Number(place.rating) || 4.5

  // Nếu người dùng chọn chế độ Free Places Only
  if (freePlacesOnly && type === 'attraction') {
    if (cost === 0) return 98 // Điểm miễn phí vé được ưu tiên tuyệt đối
    return 10 // Điểm có bán vé bị loại bỏ hoặc trừ điểm cực thấp
  }

  let targetCost = tier.targetMealCost
  if (type === 'hotel') targetCost = tier.targetHotelNight
  else if (type === 'attraction') targetCost = tier.targetTicketCost
  else if (type === 'cafe') targetCost = Math.round(tier.targetMealCost * 0.6)

  // 1. Tính độ phù hợp về giá (CostFit: 40 điểm)
  let costFitScore = 30
  const isUpscale = /fine dining|michelin|resort|galina|esco|lounge|buffet|yakiniku|lobster|steakhouse/i.test(`${place.name} ${place.description || ''}`)

  if (tierKey === 'T0' || tierKey === 'T1') {
    // Ngân sách thấp (1 - 3.5 triệu): Tuyệt đối cấm các nhà hàng/resort sang trọng
    if (isUpscale) {
      return 0 // Loại bỏ hoàn toàn khỏi gợi ý gói tiết kiệm
    }
    if (type === 'restaurant' && cost > targetCost * 1.6) {
      return 0 // Loại bỏ quán ăn đắt hơn 1.6 lần mục tiêu
    }

    if (cost === 0 && type === 'attraction') {
      costFitScore = 40 // Điểm tham quan free là cực phẩm cho gói tiết kiệm
    } else if (cost <= targetCost * 1.1) {
      costFitScore = 38
    } else if (cost <= targetCost * 1.4) {
      costFitScore = 20
    } else {
      costFitScore = 5 // Quá đắt so với túi tiền, bị trừ điểm nặng
    }
  } else if (tierKey === 'T4') {
    // Ngân sách 30 triệu (Xa hoa): Tránh các quán vỉa hè lụp xụp, ưu tiên nơi cao cấp
    if (cost >= targetCost * 0.8) {
      costFitScore = 40
    } else if (cost >= targetCost * 0.4) {
      costFitScore = 32
    } else if (cost === 0 && type !== 'attraction') {
      costFitScore = 15 // Ăn uống vỉa hè miễn phí/rẻ không phù hợp tiêu chí VIP
    } else {
      costFitScore = 25
    }
  } else {
    // T2 & T3: Cân bằng
    const ratio = targetCost > 0 ? cost / targetCost : 1
    if (ratio >= 0.7 && ratio <= 1.3) costFitScore = 40
    else if (ratio < 0.7) costFitScore = 32
    else costFitScore = Math.max(10, Math.round(40 - (ratio - 1.3) * 20))
  }

  // 2. Điểm chất lượng / Rating (QualityFit: 25 điểm)
  let qualityScore = 15
  if (rating >= 4.8) qualityScore = 25
  else if (rating >= 4.5) qualityScore = 22
  else if (rating >= 4.2) qualityScore = 18
  else qualityScore = 12

  // Với T4, đánh giá cao nếu có review khủng hoặc là resort/fine dining
  if (tierKey === 'T4' && (rating >= 4.7 || (place.reviews_count && place.reviews_count > 500))) {
    qualityScore += 5
  }

  // 3. Điểm khoảng cách (DistanceFit: 20 điểm)
  let distanceScore = 15
  if (clusterCenter && place.latitude && place.longitude && clusterCenter.latitude && clusterCenter.longitude) {
    const lat1 = Number(clusterCenter.latitude)
    const lon1 = Number(clusterCenter.longitude)
    const lat2 = Number(place.latitude)
    const lon2 = Number(place.longitude)
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const dist = R * c
    if (dist <= 3) distanceScore = 20
    else if (dist <= 8) distanceScore = 16
    else if (dist <= 15) distanceScore = 10
    else distanceScore = 4
  }

  // 4. Điểm sở thích người dùng (PreferenceFit: 15 điểm)
  let prefScore = 5
  const tags = Array.isArray(place.tags) ? place.tags : []
  if (userInterests && userInterests.length > 0) {
    const matches = tags.filter(t => userInterests.some(ui => ui.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(ui.toLowerCase())))
    if (matches.length >= 2) prefScore = 15
    else if (matches.length === 1) prefScore = 10
  } else {
    prefScore = 10
  }

  return costFitScore + qualityScore + distanceScore + prefScore
}

/**
 * Kiểm tra và cân đối lại tổng chi phí (Audit & Balance)
 */
function auditTripBudget(planResult, totalBudget, tierKey = 'T1') {
  if (!planResult || !Array.isArray(planResult.days)) return planResult

  const tier = TIER_DEFINITIONS[tierKey] || TIER_DEFINITIONS.T1
  const numDays = planResult.days.length
  const nights = Math.max(1, numDays - 1)
  const people = Number(planResult.people) || 1

  // Tính tiền vé xe (transit)
  let transitCost = 0
  if (planResult.transit_summary && planResult.transit_summary.cheapestBusTotal) {
    transitCost = Number(planResult.transit_summary.cheapestBusTotal) || 0
  } else if (planResult.budget_breakdown && planResult.budget_breakdown.transportation) {
    transitCost = Number(planResult.budget_breakdown.transportation) || 0
  }

  // Tính tiền khách sạn
  const hotelNightPrice = planResult.hotel_recommendation?.price_per_night || tier.targetHotelNight
  // Homestay/dorm (<= 300.000đ): giá tính theo người/đêm -> price * people * nights
  // Khách sạn/resort (> 300.000đ): giá theo phòng (1 phòng / 2 người) -> price * ceil(people / 2) * nights
  const totalHotelCost = hotelNightPrice <= 300000
    ? Math.round(hotelNightPrice * people * nights)
    : Math.round(hotelNightPrice * Math.max(1, Math.ceil(people / 2)) * nights)

  // Tính tiền các hoạt động (ăn uống + vé tham quan tính theo tổng số người)
  let activitiesTotal = 0
  let foodTotal = 0
  let ticketsTotal = 0

  planResult.days.forEach(day => {
    (day.activities || []).forEach(act => {
      const costPerPerson = Number(act.estimated_cost) || 0
      const totalActCost = costPerPerson * people
      activitiesTotal += totalActCost
      if (['breakfast', 'lunch', 'dinner', 'restaurant'].includes(act.type)) {
        foodTotal += totalActCost
      } else if (['attraction', 'checkin'].includes(act.type)) {
        ticketsTotal += totalActCost
      }
    })
  })

  const userTargetBudget = Number(totalBudget) || 3000000
  const calculatedTotal = transitCost + totalHotelCost + activitiesTotal
  const variance = calculatedTotal - userTargetBudget
  const percentDiff = userTargetBudget > 0 ? (variance / userTargetBudget) * 100 : 0

  let fitStatus = 'optimal'
  let isOverBudget = false
  let fitMessage = ''
  let advice = ''

  if (variance > userTargetBudget * 0.05) {
    fitStatus = 'over'
    isOverBudget = true
    fitMessage = `CẢNH BÁO BÁO ĐỎ: Kế hoạch thực tế (${calculatedTotal.toLocaleString('vi-VN')}đ) vượt quá khả năng tài chính đã chọn (${userTargetBudget.toLocaleString('vi-VN')}đ) khoảng +${Math.abs(Math.round(variance)).toLocaleString('vi-VN')}đ (+${percentDiff.toFixed(0)}%)!`
    advice = 'Khuyến nghị: Vé xe và khách sạn đã chiếm phần lớn ngân sách. Bạn nên chuyển sang chế độ "100% Điểm Miễn Phí" hoặc giảm bớt số ngày để đảm bảo an toàn tài chính.'
  } else if (variance < -userTargetBudget * 0.25) {
    fitStatus = 'under'
    fitMessage = `Ngân sách còn dư khoảng ${Math.abs(Math.round(variance)).toLocaleString('vi-VN')}đ sau khi cân đối thực tế.`
    advice = tierKey === 'T4' 
      ? 'Bạn có thể nâng cấp thêm gói Spa trị liệu 5 sao, ăn tối buffet hải sản thượng hạng hoặc đặt du thuyền ngắm hoàng hôn!'
      : 'Bạn có thêm quỹ tiền mua đặc sản làm quà hoặc tận hưởng thêm cafe view đẹp.'
  } else {
    fitStatus = 'optimal'
    fitMessage = `Tổng chi phí cân đối hoàn hảo trong khoảng ngân sách (${userTargetBudget.toLocaleString('vi-VN')}đ).`
    advice = 'Chi phí đã bao gồm trọn gói: Vé xe di chuyển, phòng khách sạn, toàn bộ 3 bữa ăn mỗi ngày và vé tham quan.'
  }

  return {
    calculated_total: calculatedTotal,
    target_budget: userTargetBudget,
    is_over_budget: isOverBudget,
    over_amount: Math.max(0, Math.round(variance)),
    variance: Math.round(variance),
    percent_diff: Number(percentDiff.toFixed(1)),
    fit_status: fitStatus,
    fit_message: fitMessage,
    advice,
    audit_breakdown: {
      transit: transitCost,
      hotel: totalHotelCost,
      food: foodTotal,
      tickets: ticketsTotal,
      activities: activitiesTotal
    }
  }
}

module.exports = {
  TIER_DEFINITIONS,
  classifyTier,
  checkTripFeasibility,
  optimizeBudgetAllocation,
  scorePlaceForBudget,
  auditTripBudget
}

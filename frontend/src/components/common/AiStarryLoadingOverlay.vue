<template>
  <transition name="starry-fade">
    <div class="starry-loading-overlay">
      <!-- CONTAINER BẦU TRỜI SAO VŨ TRỤ (UIVERSE.IO BY SINFUL_9361) -->
      <div class="starry-cosmos-bg">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      <!-- CÁC BÓNG BAY & ĐÈN HOA ĐĂNG HỘI AN LƠ LỬNG BAY TỪ DƯỚI LÊN -->
      <div class="floating-balloons-layer" aria-hidden="true">
        <div class="balloon-item b1">🏮</div>
        <div class="balloon-item b2">🎈</div>
        <div class="balloon-item b3">✨</div>
        <div class="balloon-item b4">🏮</div>
        <div class="balloon-item b5">🎈</div>
        <div class="balloon-item b6">💫</div>
        <div class="balloon-item b7">🏮</div>
        <div class="balloon-item b8">🎈</div>
      </div>

      <!-- VÙNG NỘI DUNG CHÍNH (GLASSMORPHISM PANEL) -->
      <div class="starry-content-card">
        <!-- HIỆU ỨNG XE CHẠY TRÊN ĐƯỜNG (CAR ON ROAD LOADER) -->
        <div class="car-loader-wrapper">
          <div class="car-glow-backdrop"></div>
          <div class="car-loader">
            <svg
              class="car-road-container"
              width="130"
              height="85"
              viewBox="0 0 120 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path class="road" d="M8 64H112"></path>

              <g class="road-lines">
                <path d="M10 64H28"></path>
                <path d="M38 64H56"></path>
                <path d="M66 64H84"></path>
                <path d="M94 64H110"></path>
              </g>

              <g class="car">
                <path
                  class="car-body"
                  d="M24 52L29 36C30 33 32 31 35 31H69C72 31 75 33 77 36L84 52H91C94 52 96 54 96 57V60H20V57C20 54 22 52 24 52Z"
                ></path>

                <path
                  class="window"
                  d="M36 34H49V45H31L34 36C34.5 34.8 35 34 36 34Z"
                ></path>

                <path class="window" d="M52 34H68C70 34 71 35 72 37L76 45H52V34Z"></path>

                <rect class="light" x="84" y="48" width="6" height="4" rx="1"></rect>

                <g class="wheel wheel-left">
                  <circle cx="34" cy="57" r="7"></circle>
                  <circle class="hub" cx="34" cy="57" r="2.5"></circle>
                </g>

                <g class="wheel wheel-right">
                  <circle cx="78" cy="57" r="7"></circle>
                  <circle class="hub" cx="78" cy="57" r="2.5"></circle>
                </g>
              </g>

              <g class="speed-lines">
                <path d="M8 36H20"></path>
                <path d="M4 44H16"></path>
                <path d="M10 52H18"></path>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  destination: {
    type: String,
    default: 'Miền Trung'
  },
  origin: {
    type: String,
    default: 'Đà Nẵng'
  },
  days: {
    type: [Number, String],
    default: 3
  },
  nights: {
    type: [Number, String],
    default: 2
  },
  loadingMessage: {
    type: String,
    default: ''
  },
  messageIndex: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
/* TOÀN BỘ OVERLAY PHỦ KÍN MÀN HÌNH */
.starry-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
  user-select: none;
}

/* NỀN VŨ TRỤ GRADIENT CHÍNH TỪ TEMPLATE */
.starry-cosmos-bg {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  background: radial-gradient(ellipse at bottom, #321b35 0%, #090a0f 100%);
  overflow: hidden;
  z-index: 1;
}

/* 3 TẦNG SAO BẰNG BOX-SHADOW (UIVERSE.IO BY SINFUL_9361) */
#stars {
  width: 1px;
  height: 1px;
  background: transparent;
  box-shadow:
    501px 811px #fff, 1450px 1324px #fff, 1093px 1780px #fff, 1469px 678px #fff,
    904px 741px #fff, 1160px 781px #fff, 1841px 1962px #fff, 1630px 1667px #fff,
    1788px 676px #fff, 367px 1734px #fff, 1343px 156px #fff, 1283px 1142px #fff,
    1062px 378px #fff, 1395px 467px #fff, 1017px 1891px #fff, 137px 1114px #fff,
    1767px 1403px #fff, 1543px 11px #fff, 1078px 181px #fff, 1189px 1574px #fff,
    1697px 1551px #fff, 439px 472px #fff, 1491px 677px #fff, 1364px 599px #fff,
    34px 382px #fff, 1221px 1584px #fff, 1266px 1499px #fff, 169px 1907px #fff,
    1219px 1125px #fff, 659px 18px #fff, 1731px 1959px #fff, 332px 1216px #fff,
    1913px 788px #fff, 80px 712px #fff, 326px 1605px #fff, 574px 1502px #fff,
    473px 1653px #fff, 404px 975px #fff, 322px 1797px #fff, 425px 1321px #fff,
    1121px 1797px #fff, 731px 647px #fff, 891px 1584px #fff, 1523px 109px #fff,
    1379px 244px #fff, 865px 1064px #fff, 493px 956px #fff, 624px 1380px #fff,
    440px 619px #fff, 1630px 767px #fff, 955px 1196px #fff, 62px 729px #fff,
    126px 946px #fff, 1256px 896px #fff, 1444px 256px #fff, 661px 1628px #fff,
    1078px 1716px #fff, 300px 737px #fff, 1734px 413px #fff, 1296px 129px #fff,
    1771px 1678px #fff, 977px 1764px #fff, 1879px 549px #fff, 665px 1531px #fff,
    89px 701px #fff, 1084px 1183px #fff, 1597px 1576px #fff, 1354px 1774px #fff,
    554px 1471px #fff, 1469px 287px #fff, 887px 106px #fff, 1962px 766px #fff,
    638px 805px #fff, 1651px 741px #fff, 1517px 1826px #fff, 24px 1152px #fff,
    507px 558px #fff, 1262px 652px #fff, 246px 1048px #fff, 1077px 421px #fff,
    1866px 1847px #fff, 1986px 1561px #fff, 704px 632px #fff, 1991px 1875px #fff,
    1227px 395px #fff, 45px 1116px #fff, 247px 786px #fff, 890px 607px #fff,
    787px 1235px #fff, 557px 524px #fff, 1582px 1285px #fff, 1725px 1366px #fff,
    952px 747px #fff, 251px 458px #fff, 1500px 1250px #fff, 1999px 1734px #fff,
    1336px 1955px #fff, 1705px 1464px #fff, 728px 697px #fff, 594px 510px #fff,
    1345px 1990px #fff, 1919px 1803px #fff, 1117px 966px #fff, 1629px 97px #fff,
    1046px 1196px #fff, 810px 1092px #fff, 722px 976px #fff, 406px 18px #fff,
    1665px 1860px #fff, 1758px 1628px #fff, 1183px 463px #fff, 564px 239px #fff,
    13px 1767px #fff, 1482px 1472px #fff, 1700px 347px #fff, 1362px 244px #fff,
    1141px 1708px #fff, 22px 885px #fff, 374px 1309px #fff, 1034px 1037px #fff,
    1725px 1086px #fff, 1343px 1921px #fff, 596px 903px #fff, 1061px 478px #fff,
    18px 1409px #fff, 729px 1364px #fff, 264px 911px #fff, 677px 1442px #fff;
  animation: animStar 50s linear infinite;
}
#stars:after {
  content: " ";
  position: absolute;
  top: 2000px;
  width: 1px;
  height: 1px;
  background: transparent;
  box-shadow:
    501px 811px #fff, 1450px 1324px #fff, 1093px 1780px #fff, 1469px 678px #fff,
    904px 741px #fff, 1160px 781px #fff, 1841px 1962px #fff, 1630px 1667px #fff,
    1788px 676px #fff, 367px 1734px #fff, 1343px 156px #fff, 1283px 1142px #fff,
    1062px 378px #fff, 1395px 467px #fff, 1017px 1891px #fff, 137px 1114px #fff,
    1767px 1403px #fff, 1543px 11px #fff, 1078px 181px #fff, 1189px 1574px #fff,
    1697px 1551px #fff, 439px 472px #fff, 1491px 677px #fff, 1364px 599px #fff,
    34px 382px #fff, 1221px 1584px #fff, 1266px 1499px #fff, 169px 1907px #fff,
    1219px 1125px #fff, 659px 18px #fff, 1731px 1959px #fff, 332px 1216px #fff;
}

#stars2 {
  width: 2px;
  height: 2px;
  background: transparent;
  box-shadow:
    1925px 1320px #fff, 693px 1778px #fff, 1016px 711px #fff, 1171px 563px #fff,
    661px 1919px #fff, 1610px 44px #fff, 1275px 140px #fff, 1208px 1802px #fff,
    1473px 1587px #fff, 11px 1117px #fff, 853px 1757px #fff, 1149px 937px #fff,
    1353px 428px #fff, 270px 279px #fff, 258px 1404px #fff, 417px 1188px #fff,
    286px 561px #fff, 393px 1765px #fff, 147px 881px #fff, 666px 1097px #fff,
    1425px 1278px #fff, 806px 156px #fff, 1252px 561px #fff, 218px 52px #fff,
    1371px 1980px #fff, 171px 745px #fff, 1424px 89px #fff, 137px 244px #fff,
    939px 1922px #fff, 137px 1080px #fff, 1757px 50px #fff, 904px 536px #fff,
    1938px 1001px #fff, 1172px 440px #fff, 72px 1475px #fff, 102px 121px #fff,
    804px 1671px #fff, 1314px 270px #fff, 440px 1341px #fff, 1216px 511px #fff,
    1061px 1523px #fff, 97px 274px #fff, 704px 1318px #fff, 52px 1872px #fff,
    1962px 296px #fff, 111px 289px #fff, 1157px 1236px #fff, 1347px 1451px #fff;
  animation: animStar 100s linear infinite;
}
#stars2:after {
  content: " ";
  position: absolute;
  top: 2000px;
  width: 2px;
  height: 2px;
  background: transparent;
  box-shadow:
    1925px 1320px #fff, 693px 1778px #fff, 1016px 711px #fff, 1171px 563px #fff,
    661px 1919px #fff, 1610px 44px #fff, 1275px 140px #fff, 1208px 1802px #fff,
    1473px 1587px #fff, 11px 1117px #fff, 853px 1757px #fff, 1149px 937px #fff;
}

#stars3 {
  width: 3px;
  height: 3px;
  background: transparent;
  box-shadow:
    200px 981px #fff, 1731px 521px #fff, 132px 1039px #fff, 1888px 1547px #fff,
    899px 1226px #fff, 1887px 580px #fff, 1548px 1092px #fff, 1626px 689px #fff,
    254px 1072px #fff, 1684px 1211px #fff, 672px 1267px #fff, 939px 668px #fff,
    1969px 645px #fff, 1126px 983px #fff, 457px 568px #fff, 476px 876px #fff,
    829px 1896px #fff, 1364px 1846px #fff, 1507px 1120px #fff, 936px 1948px #fff,
    1833px 832px #fff, 1424px 285px #fff, 1377px 1596px #fff, 432px 153px #fff,
    1348px 1410px #fff, 1529px 954px #fff, 1102px 387px #fff, 264px 297px #fff;
  animation: animStar 150s linear infinite;
}
#stars3:after {
  content: " ";
  position: absolute;
  top: 2000px;
  width: 3px;
  height: 3px;
  background: transparent;
  box-shadow:
    200px 981px #fff, 1731px 521px #fff, 132px 1039px #fff, 1888px 1547px #fff,
    899px 1226px #fff, 1887px 580px #fff, 1548px 1092px #fff, 1626px 689px #fff;
}

@keyframes animStar {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-2000px);
  }
}

/* HIỆU ỨNG BÓNG BAY & ĐÈN HOA ĐĂNG BAY TỪ DƯỚI LÊN */
.floating-balloons-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
}

.balloon-item {
  position: absolute;
  bottom: -60px;
  font-size: 26px;
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.7));
  animation: floatUpSlow linear infinite;
  opacity: 0.85;
}

.b1 { left: 8%; font-size: 30px; animation-duration: 18s; animation-delay: 0s; }
.b2 { left: 22%; font-size: 22px; animation-duration: 24s; animation-delay: 4s; }
.b3 { left: 35%; font-size: 18px; animation-duration: 20s; animation-delay: 8s; }
.b4 { left: 52%; font-size: 32px; animation-duration: 22s; animation-delay: 2s; }
.b5 { left: 68%; font-size: 24px; animation-duration: 19s; animation-delay: 6s; }
.b6 { left: 80%; font-size: 20px; animation-duration: 25s; animation-delay: 10s; }
.b7 { left: 90%; font-size: 28px; animation-duration: 21s; animation-delay: 3s; }
.b8 { left: 14%; font-size: 22px; animation-duration: 26s; animation-delay: 12s; }

@keyframes floatUpSlow {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.85;
  }
  85% {
    opacity: 0.85;
  }
  100% {
    transform: translateY(-115vh) rotate(15deg);
    opacity: 0;
  }
}

/* THẺ NỘI DUNG TRUNG TÂM (GLASSMORPHISM THU GỌN CHỈ HIỂN THỊ XE CHẠY) */
.starry-content-card {
  position: relative;
  z-index: 10;
  max-width: 220px;
  width: auto;
  padding: 24px 28px;
  background: rgba(18, 16, 38, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.6),
    0 0 50px rgba(129, 140, 248, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  animation: introFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* CAR LOADER ANIMATION (UIVERSE CAR ON ROAD) */
.car-loader-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0;
}

.car-glow-backdrop {
  position: absolute;
  width: 140px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 140, 255, 0.3) 0%, rgba(56, 189, 248, 0.08) 60%, transparent 80%);
  filter: blur(14px);
  pointer-events: none;
}

.car-loader {
  display: flex;
  justify-content: center;
  align-items: center;
}

.car-road-container {
  overflow: visible;
  filter: drop-shadow(0 0 10px rgba(79, 140, 255, 0.4));
}

/* Road */
.road {
  stroke: #d0d0d0;
  stroke-width: 2.5;
  stroke-linecap: round;
}

.road-lines {
  stroke: #666;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 10 18;
  animation: roadMove 0.8s linear infinite;
}

/* Car */
.car {
  animation: carMove 1.8s ease-in-out infinite;
}

.car-body {
  fill: rgba(15, 23, 42, 0.85);
  stroke: #4f8cff;
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.window {
  fill: #d0d0d0;
  stroke: #4f8cff;
  stroke-width: 1.5;
}

.light {
  fill: #4f8cff;
  animation: lightBlink 1s ease-in-out infinite;
}

/* Wheels */
.wheel {
  fill: #666;
  stroke: #4f8cff;
  stroke-width: 2;
  transform-box: fill-box;
  transform-origin: center;
  animation: wheelSpin 0.6s linear infinite;
}

.hub {
  fill: #d0d0d0;
  stroke: none;
}

/* Speed lines */
.speed-lines {
  stroke: #4f8cff;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 8 12;
  animation: speedMove 0.7s linear infinite;
}

/* Road animation */
@keyframes roadMove {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: -28;
  }
}

/* Car movement */
@keyframes carMove {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
}

/* Wheel rotation */
@keyframes wheelSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Headlight */
@keyframes lightBlink {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

/* Speed lines */
@keyframes speedMove {
  from {
    stroke-dashoffset: 0;
    opacity: 0.3;
  }
  to {
    stroke-dashoffset: -20;
    opacity: 1;
  }
}

/* TRANSITIONS */
.starry-fade-enter-active,
.starry-fade-leave-active {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.starry-fade-enter-from,
.starry-fade-leave-to {
  opacity: 0;
}

@keyframes introFadeUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RESPONSIVE */
@media (max-width: 640px) {
  .starry-content-card {
    padding: 18px 22px;
  }
}
</style>

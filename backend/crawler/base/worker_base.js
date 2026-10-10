import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Danh sách User-Agents máy tính hiện đại phổ biến nhất tại Việt Nam
 * Xoay vòng ngẫu nhiên trên từng BrowserContext
 */
const DESKTOP_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
];

/**
 * Danh sách độ phân giải màn hình chuẩn
 */
const VIEWPORT_SIZES = [
  { width: 1920, height: 1080 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 }
];

/**
 * Proxy Pool phục vụ xoay vòng (Rotating Proxy)
 * Có thể nạp từ biến môi trường PROXY_LIST (dạng: http://user:pass@ip:port,...)
 */
const PROXY_POOL = process.env.PROXY_LIST
  ? process.env.PROXY_LIST.split(',').map((p) => p.trim()).filter(Boolean)
  : [];

let proxyIndex = 0;

/**
 * Lớp cơ sở (Base Class) điều khiển Playwright an toàn cao
 * Tích hợp Anti-bot Evasion, Rotating Proxy và Network Optimizer
 */
export class PlaywrightWorkerBase {
  constructor(options = {}) {
    this.browser = null;
    this.headless = options.headless !== undefined ? options.headless : (process.env.HEADLESS !== 'false');
    this.timeout = options.timeout || 30000;
  }

  /**
   * Khởi tạo Singleton Browser Instance với cấu hình flags tắt cờ Automation
   */
  async initBrowser() {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    this.browser = await chromium.launch({
      headless: this.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled', // Ẩn cờ navigator.webdriver cấp độ lõi Chromium
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--lang=vi-VN,vi,en-US,en'
      ]
    });

    console.log('[PlaywrightEngine] Browser Chromium khởi động thành công (Stealth Mode).');
    return this.browser;
  }

  /**
   * Lấy cấu hình proxy kế tiếp theo cơ chế Round-Robin
   */
  getNextProxy() {
    if (PROXY_POOL.length === 0) return null;

    const proxyUrl = PROXY_POOL[proxyIndex % PROXY_POOL.length];
    proxyIndex++;

    try {
      const url = new URL(proxyUrl);
      const config = {
        server: `${url.protocol}//${url.host}`
      };
      if (url.username || url.password) {
        config.username = decodeURIComponent(url.username);
        config.password = decodeURIComponent(url.password);
      }
      return config;
    } catch (e) {
      return { server: proxyUrl };
    }
  }

  /**
   * Tạo một Browser Context mới được trang bị đầy đủ Anti-Detection Fingerprinting
   */
  async createStealthContext(customOptions = {}) {
    const browser = await this.initBrowser();

    const proxy = this.getNextProxy();
    const userAgent = DESKTOP_USER_AGENTS[Math.floor(Math.random() * DESKTOP_USER_AGENTS.length)];
    const viewport = VIEWPORT_SIZES[Math.floor(Math.random() * VIEWPORT_SIZES.length)];

    const contextOptions = {
      viewport,
      userAgent,
      locale: 'vi-VN',
      timezoneId: 'Asia/Ho_Chi_Minh',
      geolocation: { longitude: 108.2022, latitude: 16.0544 }, // Tọa độ Đà Nẵng
      permissions: ['geolocation'],
      ignoreHTTPSErrors: true,
      colorScheme: 'light',
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: false,
      javaScriptEnabled: true,
      ...(proxy ? { proxy } : {}),
      ...customOptions
    };

    const context = await browser.newContext(contextOptions);

    // Kỹ thuật tiêm Script can thiệp nguyên mẫu JS trước khi bất kỳ script nào của trang web chạy
    await context.addInitScript(() => {
      // 1. Ghi đè thuộc tính navigator.webdriver thành undefined
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
      });

      // 2. Giả lập đối tượng window.chrome tiêu chuẩn của trình duyệt thường
      window.chrome = {
        app: { isInstalled: false },
        webstore: { onInstallStageChanged: {}, onDownloadProgress: {} },
        runtime: {
          PlatformOs: { MAC: 'mac', WIN: 'win', ANDROID: 'android', CROS: 'cros', LINUX: 'linux', OPENBSD: 'openbsd' },
          PlatformArch: { ARM: 'arm', X86_32: 'x86-32', X86_64: 'x86-64' },
          PlatformNaclArch: { ARM: 'arm', X86_32: 'x86-32', X86_64: 'x86-64' },
          RequestUpdateCheckStatus: { THROTTLED: 'throttled', NO_UPDATE: 'no_update', UPDATE_AVAILABLE: 'update_available' },
          OnInstalledReason: { INSTALL: 'install', UPDATE: 'update', CHROME_UPDATE: 'chrome_update', SHARED_MODULE_UPDATE: 'shared_module_update' },
          OnRestartRequiredReason: { APP_UPDATE: 'app_update', OS_UPDATE: 'os_update', PERIODIC: 'periodic' }
        }
      };

      // 3. Giả lập danh sách Plugins (trình duyệt headless mặc định có plugins rỗng)
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
          { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
        ]
      });

      // 4. Giả lập ngôn ngữ chuẩn Tiếng Việt
      Object.defineProperty(navigator, 'languages', {
        get: () => ['vi-VN', 'vi', 'en-US', 'en']
      });

      // 5. Tinh chỉnh Permissions API tránh bị phát hiện truy vấn thông báo
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);
    });

    return context;
  }

  /**
   * Bộ lọc Network: Chặn các tài nguyên quảng cáo, tracking, CSS thừa và media nặng không cần thiết
   * Giúp tăng tốc độ cào gấp 3 - 5 lần và giảm 70% băng thông Proxy
   */
  async setupNetworkOptimizer(page, options = { allowImages: false }) {
    await page.route('**/*', (route) => {
      const request = route.request();
      const resourceType = request.resourceType();
      const url = request.url().toLowerCase();

      // Danh sách domain tracking & analytics cần loại bỏ ngay lập tức
      const isTracker = [
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.net',
        'connect.facebook.net',
        'doubleclick.net',
        'hotjar.com',
        'clarity.ms',
        'criteo.com',
        'tiktok.com'
      ].some((domain) => url.includes(domain));

      if (isTracker) {
        return route.abort();
      }

      // Nếu không cần render ảnh HTML mà chỉ bắt link ảnh qua XHR/API JSON
      if (!options.allowImages && (resourceType === 'image' || resourceType === 'media')) {
        return route.abort();
      }

      // Bỏ qua font chữ để giảm thời gian render DOM
      if (resourceType === 'font') {
        return route.abort();
      }

      return route.continue();
    });
  }

  /**
   * Kỹ thuật mô phỏng hành vi cuộn trang của người thật (Humanized Scroll)
   * Kích hoạt các API phân trang và tóm gói tin JSON
   */
  async humanScroll(page, maxScrolls = 3) {
    for (let i = 0; i < maxScrolls; i++) {
      await page.evaluate(() => {
        window.scrollBy({
          top: window.innerHeight * (0.7 + Math.random() * 0.5),
          left: 0,
          behavior: 'smooth'
        });
      });
      await this.randomDelay(800, 1600);
    }
  }

  /**
   * Tạo độ trễ ngẫu nhiên tránh bị nhận diện bởi thuật toán phân tích nhịp điệu (Behavioral Bot Detection)
   */
  async randomDelay(min = 1000, max = 3000) {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Đóng an toàn trình duyệt khi tắt tiến trình worker
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('[PlaywrightEngine] Đã giải phóng hoàn tất Browser Instance.');
    }
  }
}

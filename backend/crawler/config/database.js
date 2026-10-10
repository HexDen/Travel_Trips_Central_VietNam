import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * Cấu hình PostgreSQL Connection Pool tích hợp PostGIS
 * Hỗ trợ các truy vấn không gian (Spatial Queries) phục vụ thuật toán tối ưu hóa lịch trình
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/travel_central_vn',
  max: 20, // Số lượng connection tối đa trong pool cho concurrent workers
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('[PostgreSQL Error] Unexpected idle client error:', err.message);
});

/**
 * Thực thi câu lệnh SQL với log hiệu năng
 */
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`[Slow Query ${duration}ms]: ${text.substring(0, 100)}...`);
    }
    return res;
  } catch (error) {
    console.error(`[DB Query Error]: ${error.message} | SQL: ${text.substring(0, 120)}`);
    throw error;
  }
}

/**
 * Khởi tạo phần mở rộng PostGIS và cấu trúc bảng phục vụ thuật toán lịch trình
 * Liên kết chặt chẽ với các thuật toán định tuyến (Routing), gom cụm (Clustering), lọc theo ngân sách
 */
export async function initPostGISSchema() {
  const client = await pool.connect();
  try {
    console.log('[PostgreSQL] Khởi tạo Extension PostGIS & Bảng dữ liệu không gian...');
    
    await client.query('BEGIN');

    // 1. Kích hoạt PostGIS Spatial Extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    // 2. Bảng Địa điểm tham quan (Places / POIs)
    await client.query(`
      CREATE TABLE IF NOT EXISTS places (
        id SERIAL PRIMARY KEY,
        external_id VARCHAR(100) UNIQUE,
        name VARCHAR(255) NOT NULL,
        destination VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL, -- attraction, restaurant, hotel, cafe
        description TEXT,
        address TEXT,
        image_url TEXT,
        gallery JSONB DEFAULT '[]'::jsonb,
        tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        estimated_cost NUMERIC(12, 2) DEFAULT 0,
        ticket_price NUMERIC(12, 2) DEFAULT 0,
        rating NUMERIC(3, 2) DEFAULT 4.5,
        reviews_count INT DEFAULT 0,
        open_hours VARCHAR(100),
        dwell_time VARCHAR(50),
        best_time VARCHAR(100),
        is_indoor BOOLEAN DEFAULT FALSE,
        signature_dishes TEXT[] DEFAULT ARRAY[]::TEXT[],
        signature_highlight TEXT,
        price_range VARCHAR(100),
        dress_code VARCHAR(100),
        closing_days VARCHAR(100),
        district VARCHAR(100),
        source_target VARCHAR(100),
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        geom geometry(Point, 4326),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Bảng Khách sạn & Phòng lưu trú (Hotels / Accommodations)
    await client.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        external_id VARCHAR(100) UNIQUE,
        name VARCHAR(255) NOT NULL,
        destination VARCHAR(100) NOT NULL,
        stars INT DEFAULT 3,
        rating NUMERIC(3, 2) DEFAULT 4.5,
        reviews_count INT DEFAULT 0,
        address TEXT,
        image_url TEXT,
        gallery JSONB DEFAULT '[]'::jsonb,
        amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
        price_from NUMERIC(12, 2) NOT NULL,
        rooms JSONB DEFAULT '[]'::jsonb,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        geom geometry(Point, 4326),
        source_url TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Bảng Vé xe liên tỉnh (Bus Tickets)
    await client.query(`
      CREATE TABLE IF NOT EXISTS bus_tickets (
        id SERIAL PRIMARY KEY,
        trip_code VARCHAR(100),
        origin VARCHAR(100) NOT NULL,
        destination VARCHAR(100) NOT NULL,
        operator_name VARCHAR(150) NOT NULL,
        seat_class VARCHAR(100) DEFAULT 'Limousine',
        price NUMERIC(12, 2) NOT NULL,
        duration VARCHAR(50),
        departure_time VARCHAR(20),
        departure_station VARCHAR(255),
        arrival_station VARCHAR(255),
        available_seats INT DEFAULT 0,
        hotline VARCHAR(50),
        rating NUMERIC(3, 2) DEFAULT 4.5,
        amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
        booking_source VARCHAR(100),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_trip_departure UNIQUE(operator_name, origin, destination, departure_time)
      );
    `);

    // 5. Tạo Spatial GIST Indexes cho thuật toán tìm kiếm lân cận (ST_DWithin, ST_DistanceSphere)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_places_geom ON places USING GIST (geom);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_places_dest_type ON places (destination, type);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hotels_geom ON hotels USING GIST (geom);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_hotels_dest_price ON hotels (destination, price_from);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bus_route ON bus_tickets (origin, destination, price);`);

    await client.query('COMMIT');
    console.log('[PostgreSQL] Đã khởi tạo hoàn tất cấu trúc cơ sở dữ liệu PostGIS!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL Init Error]:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

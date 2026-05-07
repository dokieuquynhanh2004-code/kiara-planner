# Kiara Planner — CLAUDE.md

Hướng dẫn cho Claude Code khi làm việc với project này.

## Tổng quan project

Web app quản lý content mạng xã hội. Stack: Bun + Express (backend) + React + Vite + Tailwind v4 (frontend) + SQLite.

## Cấu trúc thư mục

```
kiara-planner/
├── backend/
│   ├── server.js           # Entry point Express, port 5000
│   ├── .env                # PORT, JWT_SECRET, CLIENT_URL, DB_PATH
│   ├── db/
│   │   ├── database.js     # better-sqlite3, singleton connection
│   │   ├── schema.sql      # CREATE TABLE IF NOT EXISTS (idempotent)
│   │   └── seed.js         # Reset và tạo lại demo data
│   ├── middleware/
│   │   ├── auth.js         # JWT Bearer token verify
│   │   └── errorHandler.js # Global error handler
│   └── routes/
│       ├── auth.js         # register, login, me, logout, profile, password
│       ├── posts.js        # CRUD bài đăng + PATCH status
│       ├── ideas.js        # CRUD ý tưởng + favorite + convert
│       └── analytics.js    # summary, heatmap
│
└── frontend/
    ├── vite.config.js      # proxy /api → localhost:5000, tailwind plugin
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx         # BrowserRouter > ToastProvider > AuthProvider > Routes
    │   ├── index.css       # @import "tailwindcss"
    │   ├── api/
    │   │   └── axios.js    # baseURL=/api, JWT interceptor, 401 redirect
    │   ├── context/
    │   │   ├── AuthContext.jsx   # user state, login(), logout(), restore from token
    │   │   └── ToastContext.jsx  # showToast(msg, type), auto-dismiss 3s
    │   ├── components/
    │   │   ├── Sidebar.jsx       # Desktop nav (hidden lg:flex)
    │   │   ├── BottomNav.jsx     # Mobile nav (lg:hidden)
    │   │   ├── Navbar.jsx        # Header tên trang + brand_name
    │   │   ├── Modal.jsx         # Overlay, ESC/click ngoài đóng
    │   │   ├── PostModal.jsx     # Modal tạo/sửa bài, hashtag pill input
    │   │   ├── PostCard.jsx      # Card bài đăng
    │   │   ├── IdeaCard.jsx      # Card ý tưởng (dùng trong Home)
    │   │   ├── PlatformBadge.jsx # Badge màu platform
    │   │   └── StatusBadge.jsx   # Badge màu trạng thái
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── Home.jsx          # Dashboard: 4 stats + sắp đăng + ý tưởng
    │       ├── Calendar.jsx      # Lưới lịch tháng + panel ngày
    │       ├── Ideas.jsx         # Kho ý tưởng, lọc, sort
    │       ├── Analytics.jsx     # Bar chart + donut SVG + heatmap + streak
    │       └── Profile.jsx       # Sửa hồ sơ + đổi mật khẩu
```

## Lệnh hay dùng

```bash
# Chạy backend
bun backend/server.js

# Chạy frontend
cd frontend && bun run dev

# Reset dữ liệu demo
bun backend/db/seed.js

# Kiểm tra backend sống
curl http://localhost:5000/api/health

# Test đăng nhập demo
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@kiara.com","password":"demo1234"}'
```

## Quy tắc code

- Không dùng `async/await` với better-sqlite3 — thư viện này synchronous
- Tất cả route backend đều trả JSON
- Frontend gọi API qua `/api/...` (Vite proxy tự chuyển sang port 5000)
- Màu chính: hồng `#f472b6`, tím `#a78bfa`, nền `#fafafa`
- Tailwind v4: không có `tailwind.config.js`, cấu hình qua `@tailwindcss/vite` plugin
- Toast: dùng `useToast()` từ ToastContext, không dùng `alert()`
- Modal: dùng component `Modal.jsx` chung

## Những điều KHÔNG được làm

- **Không xóa** `backend/db/seed.js` hoặc thay đổi email/mật khẩu demo
- **Không thay đổi port** (backend 5000, frontend 5173)
- **Không cài thêm** thư viện chart (recharts, chart.js...) — biểu đồ dùng CSS/SVG thuần
- **Không thay đổi** schema.sql nếu không cần thiết — schema dùng `CREATE TABLE IF NOT EXISTS`
- **Không commit** file `.env` hoặc `kiara.db`
- **Không dùng** `window.alert()` — dùng Toast
- **Không thay đổi** cấu trúc response của API backend (các trang frontend phụ thuộc vào đó)

## API chính

```
POST /api/auth/register       body: {name, email, password, brand_name?, industry?}
POST /api/auth/login          body: {email, password}
GET  /api/auth/me             header: Authorization Bearer
PUT  /api/auth/profile        body: {name, brand_name?, industry?}
PUT  /api/auth/password       body: {current_password, new_password}

GET  /api/posts               query: platform?, status?, month=YYYY-MM
POST /api/posts               body: {title, content_type, platform, status?, ...}
PUT  /api/posts/:id
DELETE /api/posts/:id
PATCH /api/posts/:id/status   body: {status}

GET  /api/ideas               query: mood?, platform?, keyword?
POST /api/ideas               body: {title, description?, mood?, platforms?, tags?}
PUT  /api/ideas/:id
DELETE /api/ideas/:id
PATCH /api/ideas/:id/favorite
POST  /api/ideas/:id/convert

GET  /api/analytics/summary
GET  /api/analytics/heatmap   query: month=YYYY-MM
```

# Kiara Planner

Web app quản lý nội dung mạng xã hội dành cho content creator và thương hiệu cá nhân.

## Tính năng chính

- **Lịch đăng bài** — xem lịch tháng, chấm màu theo platform, click ngày xem danh sách bài
- **Kho ý tưởng** — lưu, lọc, đánh dấu yêu thích và chuyển ý tưởng thành bài đăng
- **Tạo & quản lý bài đăng** — hỗ trợ 5 platform, 4 trạng thái, hashtag tự động
- **Thống kê trực quan** — biểu đồ cột, donut chart SVG, heatmap hoạt động, streak
- **Hồ sơ cá nhân** — chỉnh sửa thông tin, đổi mật khẩu
- **Responsive** — hoạt động tốt trên cả desktop và mobile

## Tech Stack

| Phần | Công nghệ |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router v7 |
| Backend | Node.js, Express 4, Bun runtime |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| HTTP Client | Axios |

## Cài đặt và chạy

### Yêu cầu
- [Bun](https://bun.sh) >= 1.0

### Backend

```bash
cd kiara-planner

# Cài dependencies
bun install

# Tạo dữ liệu mẫu (chỉ chạy lần đầu)
bun backend/db/seed.js

# Chạy backend (port 5000)
bun backend/server.js
```

### Frontend

```bash
cd kiara-planner/frontend

# Cài dependencies
bun install

# Chạy dev server (port 5173)
bun run dev
```

Mở trình duyệt tại: **http://localhost:5173**

## Tài khoản demo

| Trường | Giá trị |
|---|---|
| Email | `demo@kiara.com` |
| Mật khẩu | `demo1234` |

Tài khoản demo có sẵn 15 bài đăng và 10 ý tưởng mẫu.

## Cấu trúc thư mục

```
kiara-planner/
├── backend/
│   ├── db/
│   │   ├── database.js     # Kết nối SQLite
│   │   ├── schema.sql      # Schema tạo bảng
│   │   └── seed.js         # Dữ liệu mẫu
│   ├── middleware/
│   │   ├── auth.js         # JWT middleware
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js         # /api/auth/*
│   │   ├── posts.js        # /api/posts/*
│   │   ├── ideas.js        # /api/ideas/*
│   │   └── analytics.js    # /api/analytics/*
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── components/     # Sidebar, Modal, PostModal, ...
│   │   └── pages/          # Home, Calendar, Ideas, Analytics, Profile
│   └── vite.config.js
├── README.md
├── CLAUDE.md
└── PLAN.md
```

## Tác giả

**Đỗ Kiều Quỳnh Anh**

Dự án xây dựng với sự hỗ trợ của Claude Code (Anthropic).

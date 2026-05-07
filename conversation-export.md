# Conversation Export — Xây dựng Kiara Planner với Claude Code

Tài liệu này ghi lại quá trình sử dụng Claude Code để xây dựng Kiara Planner từ đầu.

## Tổng quan

- **Tổng số prompt chính:** 4 prompt lớn
- **Thời gian:** ~3 phiên làm việc
- **Kết quả:** Full-stack web app hoàn chỉnh

---

## Prompt 1 — Khởi tạo Backend

**Nội dung yêu cầu:**
> Kiểm tra project kiara-planner hiện tại: liệt kê tất cả file đã có, server backend có chạy được không, nếu chưa thì khởi động lại.

**Những gì Claude Code đã làm:**
1. Tìm kiếm thư mục `kiara-planner` trong hệ thống
2. Liệt kê tất cả file (ngoài `node_modules`)
3. Kiểm tra backend đang chạy bằng `curl http://localhost:5000/api/health`
4. Khởi động lại server khi phát hiện chưa chạy
5. Báo cáo đầy đủ cấu trúc và trạng thái

**Kết quả:**
- Backend chạy tại port 5000
- Phát hiện project chỉ có backend, chưa có frontend
- Xác định tech stack: Bun + Express + SQLite + JWT

---

## Prompt 2 — Tạo Frontend (8 bước)

**Nội dung yêu cầu:** Tạo toàn bộ frontend React với Vite, Tailwind, cấu trúc thư mục, các trang cơ bản.

**Prompt bao gồm:**
- Bước 1: Khởi tạo Vite React app, cài thư viện
- Bước 2: Cấu trúc thư mục `pages/`, `components/`, `api/`, `context/`
- Bước 3: `axios.js` với interceptor JWT + 401 redirect
- Bước 4: `AuthContext.jsx` với login/logout/restore
- Bước 5: 8 component dùng chung
- Bước 6: Layout (Sidebar, BottomNav, Navbar, App.jsx)
- Bước 7: Login, Register pages
- Bước 8: Home page với 4 stats cards

**Lỗi gặp phải và cách Claude tự xử lý:**

1. **Tailwind v4 khác v3** — Claude phát hiện `bun add tailwindcss` cài v4, không cần `postcss.config.js`, tự điều chỉnh dùng `@tailwindcss/vite` plugin và `@import "tailwindcss"` thay vì `@tailwind base/components/utilities`.

2. **Vite scaffold có file mẫu** — `App.jsx` và `index.css` ban đầu có code mặc định của Vite template. Claude đọc file trước khi ghi đè để tránh lỗi "File has not been read yet".

**Kết quả:** 20+ file được tạo, app chạy tại localhost:5173, đăng nhập demo thành công.

---

## Prompt 3 — 3 Trang Chính + PostModal

**Nội dung yêu cầu:** Hoàn thiện Calendar (lưới lịch), Ideas (kho ý tưởng nâng cao), tạo PostModal dùng chung.

**Những tính năng phức tạp nhất:**

**Calendar — lưới lịch tháng:**
- Tính offset ngày đầu tháng (T2=0, CN=6)
- Nhóm bài đăng theo ngày (`groupByDay`)
- Chấm màu theo platform, tối đa 3 + "+N nữa"
- Panel trượt bên phải khi click ngày
- Điều hướng tháng trước/sau

**PostModal — hashtag pill input:**
- Gõ tag → nhấn Enter → thành pill màu hồng
- Backspace khi input rỗng → xóa pill cuối
- Click × trên pill → xóa riêng tag đó
- Platform chọn 1 với màu background thực
- Nút "Lên lịch" chỉ hiện khi đã chọn datetime

**Ideas — filter tabs + inline actions:**
- Tab mood có emoji (📚 Giáo dục, 🎭 Giải trí...)
- Sort yêu thích trước (re-sort sau mỗi toggle)
- Chuyển bài → toast xanh → auto navigate sang `/calendar`

**Kết quả:** 4 file tạo/sửa, HMR cập nhật tức thì không lỗi.

---

## Prompt 4 — Hoàn thiện và Nộp Bài

**Nội dung yêu cầu:** Analytics đầy đủ, Profile với đổi mật khẩu, Toast system, file nộp bài.

**Thêm route backend:** Claude phát hiện backend chưa có `PUT /api/auth/profile` và `PUT /api/auth/password`, tự thêm vào `routes/auth.js` rồi restart server.

**Analytics — biểu đồ không dùng thư viện:**

*Bar chart CSS:* Dùng `height: ${(count/max)*100}%` với flex container, mỗi cột màu của platform.

*Donut chart SVG:* Kỹ thuật `stroke-dasharray` trên `<circle>`:
```
circumference = 2 * π * r = 327
segment_dash = (count/total) * circumference
stroke-dashoffset = -(accumulated_offset)
```

**Toast system:** `ToastContext` với `showToast(msg, type)`, auto-dismiss 3s, stack nhiều toast.

**Bài học rút ra:**
1. Đọc file trước khi ghi (`Read` trước `Write/Edit`) — Claude bắt buộc làm vậy
2. Tailwind v4 config hoàn toàn khác v3 — cần kiểm tra version khi cài
3. Chia prompt thành các bước rõ ràng giúp Claude thực hiện đúng thứ tự
4. Claude tự phát hiện và thêm backend route còn thiếu mà không cần prompt riêng
5. Dùng HMR của Vite — có thể thấy kết quả ngay sau mỗi file được sửa

---

## Thống kê cuối

| Hạng mục | Số lượng |
|---|---|
| File backend | 8 file |
| File frontend | 20+ file |
| API endpoints | 16 endpoint |
| Tổng dòng code | ~3.000 dòng |
| Thư viện frontend | react-router-dom, axios, tailwindcss |
| Thư viện backend | express, better-sqlite3, bcryptjs, jsonwebtoken |

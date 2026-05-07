# Kiara Planner — Kế hoạch xây dựng

## Ý tưởng ban đầu

**Vấn đề thực tế:** Content creator và chủ thương hiệu nhỏ thường gặp khó khăn trong việc lên kế hoạch và theo dõi nội dung đăng trên nhiều nền tảng mạng xã hội cùng lúc. Họ thường dùng giấy tờ, Google Sheets hoặc nhớ trong đầu — dễ bị bỏ sót, không có cái nhìn tổng quan.

**Giải pháp:** Xây dựng một web app đơn giản, đẹp mắt, tập trung vào trải nghiệm người dùng, giúp:
1. Lên lịch bài đăng cho từng platform
2. Lưu giữ và tổ chức ý tưởng
3. Xem tổng quan hoạt động qua thống kê

**Lý do chọn tên Kiara:** Tên gợi lên sự sáng tạo, trẻ trung, phù hợp với đối tượng content creator.

## Kế hoạch xây dựng

### Phần 1 — Backend API
- Thiết kế schema SQLite: users, posts, ideas
- Xây dựng REST API với Express + Bun
- JWT authentication
- CRUD đầy đủ cho posts và ideas
- API analytics: summary + heatmap

### Phần 2 — Frontend cơ bản
- Khởi tạo Vite + React + Tailwind v4
- Cấu hình proxy API
- AuthContext, axios interceptor
- Layout: Sidebar (desktop) + BottomNav (mobile)
- Trang Login, Register
- Trang Home (dashboard)

### Phần 3 — Các trang chính
- Calendar: lưới lịch tháng với chấm màu platform
- Ideas: kho ý tưởng với filter và sort
- PostModal: component dùng chung cho tạo/sửa bài
- Chuyển ý tưởng thành bài đăng

### Phần 4 — Hoàn thiện
- Analytics: biểu đồ cột CSS, donut SVG, heatmap, streak
- Profile: sửa hồ sơ, đổi mật khẩu, thống kê cá nhân
- Toast notification system
- Responsive hoàn chỉnh

## Tính năng đã làm được

- [x] Đăng ký / Đăng nhập / Đăng xuất với JWT
- [x] Tạo, sửa, xóa bài đăng (5 platform, 4 trạng thái)
- [x] Lên lịch bài đăng với datetime picker
- [x] Hashtag pill input trong PostModal
- [x] Kho ý tưởng với lọc theo mood / platform / keyword
- [x] Yêu thích ý tưởng (toggle)
- [x] Chuyển ý tưởng thành bài nháp (1 click)
- [x] Lịch tháng với chấm màu platform
- [x] Panel ngày (click ô lịch xem bài của ngày đó)
- [x] Dashboard: 4 metric cards + danh sách sắp đăng + ý tưởng mới
- [x] Biểu đồ cột theo platform (CSS thuần)
- [x] Donut chart theo trạng thái (SVG)
- [x] Heatmap hoạt động theo tháng
- [x] Streak: đếm ngày liên tiếp có bài
- [x] Chỉnh sửa hồ sơ (tên, thương hiệu, ngành nghề)
- [x] Đổi mật khẩu (xác thực mật khẩu cũ)
- [x] Toast notification (success/error/warning)
- [x] Loading spinner khi đang gọi API
- [x] Empty state đẹp khi chưa có data
- [x] Responsive: Sidebar desktop + BottomNav mobile

## Tính năng có thể mở rộng

- **Upload ảnh:** Avatar user, thumbnail bài đăng
- **Lịch tuần:** View tuần bên cạnh view tháng
- **AI gợi ý caption:** Tích hợp Claude API để gợi ý nội dung
- **Xuất lịch:** Export sang Google Calendar / CSV
- **Multi-user:** Workspace team, phân quyền editor/viewer
- **Thông báo:** Email reminder trước giờ đăng
- **Template bài đăng:** Lưu mẫu caption hay dùng
- **Analytics nâng cao:** So sánh tháng này vs tháng trước
- **Dark mode**
- **PWA:** Cài app trên điện thoại

## Khó khăn và cách giải quyết

### 1. Tailwind CSS v4 — config khác hoàn toàn v3
**Vấn đề:** Tailwind v4 không dùng `tailwind.config.js` và `postcss.config.js` như v3.  
**Giải pháp:** Dùng `@tailwindcss/vite` plugin thay vì PostCSS, import bằng `@import "tailwindcss"` trong CSS.

### 2. Lịch tháng — tính toán offset ngày đầu tháng
**Vấn đề:** Mỗi tháng bắt đầu từ thứ khác nhau, cần tính số ô trống trước ngày 1.  
**Giải pháp:** `getDay()` trả về 0 (CN) đến 6 (T7), điều chỉnh để T2=0.

### 3. Donut chart không dùng thư viện
**Vấn đề:** Cần vẽ biểu đồ tròn mà không import recharts/chart.js.  
**Giải pháp:** SVG với kỹ thuật `stroke-dasharray` + `stroke-dashoffset`, tính từng segment.

### 4. SQLite synchronous với Express async
**Vấn đề:** better-sqlite3 synchronous, dễ nhầm với async patterns.  
**Giải pháp:** Dùng `try/catch` + `next(err)`, không dùng `.then()` hay `await` với db.

### 5. Proxy CORS cho dev
**Vấn đề:** Frontend port 5173, backend port 5000 — bị CORS block khi gọi trực tiếp.  
**Giải pháp:** Vite proxy `/api` → `http://localhost:5000`, frontend gọi `/api/...`.

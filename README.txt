HR Persona Scanner — gói web tĩnh
=================================
Mở index.html bằng trình duyệt, hoặc đưa cả thư mục lên bất kỳ host tĩnh nào (Netlify, Vercel, S3, GitHub Pages…).

Cấu trúc
  index.html            trang chính
  css/tokens.css        token màu/chữ/khoảng cách (design system TCP)
  css/components.css    thành phần (nút, input, badge…)
  css/app.css           bố cục trang chủ, chọn nhân vật, câu hỏi, form
  css/result.css        trang kết quả (Thẻ Nhân Vật)
  js/content.js         TOÀN BỘ câu chữ + cấu hình (CONFIG) — sửa nội dung ở đây
  js/persona-content.js nội dung 6 chân dung (sinh từ đặc tả mục 10)
  js/scoring.js         logic tính điểm (hàm thuần)
  js/app.js             giao diện / điều hướng
  js/vendor/lucide.min.js  bộ icon (đã đóng gói sẵn, không cần mạng)
  assets/               hình ảnh đang dùng

Ghi chú
- Font Inter tải từ Google Fonts; khi offline trang tự dùng font dự phòng của máy.
- Công cụ nội bộ "Preview UI kết quả" (góc phải dưới, duyệt 10 trường hợp kết quả) và
  "Điền dữ liệu mẫu" (form) KHÔNG hiện cho người dùng. Chỉ hiện khi chạy ở localhost
  hoặc mở link có ?dev=1 (nhớ trong tab đó; ?dev=0 để tắt). Tắt hẳn: CONFIG.DEV_TOOLS = false.
- Form chưa nối backend: dữ liệu chỉ nằm trong sessionStorage của trình duyệt.

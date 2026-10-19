/* =========================================================================
   HR Persona Scanner — Nội dung & cấu hình
   Mọi câu chữ hiển thị nằm ở đây (đặc tả mục 1.6, 10). Component không chứa chuỗi.
   ========================================================================= */

/* Các giá trị [MỞ] (đặc tả mục 14.2, 17) */
window.CONFIG = {
  EVENT_NAME: 'HRDigest 2026',
  FORM_MODE: 'full',                 // 'full' | 'short'
  MARKETING_CONSENT_TEXT: 'Tôi đồng ý nhận thông tin về các chương trình của Talent Connect Plus qua email.',
  BOOTH_IDLE_RESET_SECONDS: 90,
  TIME_PROMISE_SECONDS: 60,
  /* Công cụ preview UI (nút "Xem nhanh kết quả", "Điền dữ liệu mẫu"): hiện ở mọi môi trường kèm ghi chú TEXT.devNote.
     Tắt hẳn khi chạy thật với người dùng: DEV_TOOLS = false. */
  DEV_TOOLS: true,
};

window.ORDER = ['KT', 'DH', 'TP', 'GN', 'GM', 'TL'];

/* 6 chân dung — ảnh nằm ở assets/{mã}.jpg; màu lấy từ token --persona-{mã} */
window.PERSONAS = {
  KT: { name: 'Nhà Kiến Tạo',     en: 'The Architect', role: 'Strategic Partner',
        chatRieng: 'Người mà cứ thấy một việc lặp lại tới lần thứ ba là tay đã ngứa ngáy muốn dựng quy trình.' },
  DH: { name: 'Người Đồng Hành',  en: 'The Coach',     role: 'Employee Champion / Human Capital Curator',
        chatRieng: 'Người mà cả công ty ai có chuyện buồn cũng tự động tìm tới bàn, dù bạn chưa kịp uống hết ly cà phê.' },
  TP: { name: 'Người Tiên Phong', en: 'The Pioneer',   role: 'Change Agent',
        chatRieng: 'Người lúc nào cũng có một tab đang mở về một công cụ mới mà cả phòng chưa ai nghe tên.' },
  GN: { name: 'Người Giữ Nhịp',   en: 'The Guardian',  role: 'Administrative Expert / Compliance Manager',
        chatRieng: 'Người đọc kỹ tới điều khoản mục c trong khi mọi người mới lướt xong dòng đầu tiên.' },
  GM: { name: 'Nhà Giải Mã',      en: 'The Analyst',   role: 'Analytics Designer & Interpreter',
        chatRieng: 'Người mà mọi cuộc tranh luận trong phòng đều kết thúc bằng câu: cho mình xin cái số liệu.' },
  TL: { name: 'Người Truyền Lửa', en: 'The Catalyst',  role: 'Culture & Change Champion',
        chatRieng: 'Người bước vào phòng là không khí tự ấm lên vài độ, khỏi cần bật máy sưởi.' },
};

/* Bộ câu hỏi — thứ tự lưu trữ (đặc tả 5.1). Thứ tự hiển thị đáp án được xáo mỗi lượt.
   img: minh họa theo nhân vật đã chọn ở bước "Chọn nhân vật" (Figma 265:3450 … 267:3424). */
window.QUESTIONS = [
  { q: 'Sáng thứ Hai, việc đầu tiên bạn làm?', img: { female: 'assets/q1-f.webp', male: 'assets/q1-m.webp' }, a: {
    KT: 'Mở lại kế hoạch dài hạn, xem đang ở đâu', DH: 'Đi một vòng hỏi thăm cả team', TP: 'Thử ngay cái tool mới cuối tuần thấy',
    GN: 'Rà checklist, xem có gì sót', GM: 'Mở dashboard, soi số tuần qua', TL: 'Khuấy động, kéo tinh thần cả phòng lên' } },
  { q: 'Đồng nghiệp tìm đến bạn nhiều nhất để…', img: { female: 'assets/q2-f.webp', male: 'assets/q2-m.webp' }, a: {
    KT: 'Nhờ nhìn bức tranh tổng thể', DH: 'Tâm sự, cần người lắng nghe', TP: 'Hỏi có cách nào mới hơn không',
    GN: 'Chắc chắn làm vậy có đúng luật không', GM: 'Xin số liệu, bằng chứng', TL: 'Rủ làm cho có khí thế' } },
  { q: 'Trong cuộc họp căng, bạn là người…', img: { female: 'assets/q3-f.webp', male: 'assets/q3-m.webp' }, a: {
    KT: 'Kéo mọi người về mục tiêu lớn', DH: 'Để ý ai đang căng, ai im lặng', TP: 'Ném ra một hướng đi lạ',
    GN: 'Giữ cho đúng nguyên tắc, công bằng', GM: 'Hỏi "căn cứ vào đâu?"', TL: 'Pha trò, kéo năng lượng cả phòng lên' } },
  { q: 'Điều khiến bạn khó chịu nhất ở chỗ làm?', img: { female: 'assets/q4-f.webp', male: 'assets/q4-m.webp' }, a: {
    KT: 'Mọi thứ chắp vá, không hệ thống', DH: 'Người giỏi bị phớt lờ', TP: 'Câu "xưa giờ vẫn vậy mà"',
    GN: 'Làm ẩu, phá luật', GM: 'Quyết định cảm tính, không số liệu', TL: 'Không khí nguội lạnh, ai làm việc nấy' } },
  { q: 'Một lời khen bạn thầm mong nghe nhất?', img: { female: 'assets/q5-f.webp', male: 'assets/q5-m.webp' }, a: {
    KT: '"Nhờ bạn mà cả tổ chức biết mình đang đi về đâu"', DH: '"Nhờ bạn tôi tin vào mình hơn"', TP: '"Bạn luôn đi trước một bước"',
    GN: '"Có bạn là yên tâm, chẳng lo sai"', GM: '"Số liệu bạn đưa cứu cả quyết định"', TL: '"Đội này đầy lửa là nhờ bạn"' } },
  { q: 'Điều bạn âm thầm tự hào nhất?', img: { female: 'assets/q6-f.webp', male: 'assets/q6-m.webp' }, a: {
    KT: 'Xây được thứ chạy bền khi mình đi', DH: 'Là chỗ dựa cho nhiều người', TP: 'Luôn mang về cái mới',
    GN: 'Giữ mọi thứ an toàn, chuẩn mực', GM: 'Đọc được câu chuyện sau con số', TL: 'Thắp được lửa cho cả tập thể' } },
];

window.TEXT = {
  brand: 'Talent Connect Plus',
  brandShort: 'Talent Connect +',
  home: {
    title: ['Bạn thuộc', 'hình mẫu HR nào?'],   // dòng 1 màu chàm, dòng 2 tô cam (orange/500)
    lead: 'Mỗi người làm nhân sự đều sở hữu một phong cách riêng trong định hướng và phát triển con người. Cùng TCP tìm hiểu ngay chân dung HR của chính mình qua bài kiểm tra ngắn sau đây.',
    method: 'Được phát triển dựa trên mô hình vai trò nổi tiếng của Dave Ulrich.',
    // Icon minh họa lấy từ Figma (node 2:2022), kèm một nhãn ngắn
    facts: [
      { img: 'assets/icon-time.svg',    label: '{seconds} giây' },
      { img: 'assets/icon-quiz.svg',    label: '6 câu hỏi' },
      { img: 'assets/icon-persona.svg', label: '6 chân dung' },
    ],
    socialProof: ['1000+ người đã kiểm tra', 'Bạn thì sao?'],   // mỗi phần tử một dòng · [MỞ] con số cần Business xác nhận
    cta: 'Khám phá ngay',
    heroAlt: 'Sáu người làm nhân sự ngồi trò chuyện trên bậc thềm',
    badge: 'Talent Connect Plus × {event}',
    stripLabel: 'Sáu chân dung HR',
    cardsEyebrow: 'Mô hình vai trò HR của Dave Ulrich',
    cardsTitle: '6 chân dung HR',
    disclaimer: '*Các thông tin này chỉ mang mục đích tham khảo',
  },
  faq: [
    { q: 'Khi hai chân dung bằng điểm thì sao?',
      a: 'Khi hai chân dung bằng điểm nhau, hệ thống ưu tiên chân dung bạn chọn ở câu gần cuối nhất. Đây là quy tắc phân xử cố định, áp dụng như nhau cho mọi người chơi.' },
    { q: 'Bài trắc nghiệm dựa trên cơ sở nào?',
      a: 'Bài đánh giá dựa trên mô hình vai trò HR của Dave Ulrich (Human Resource Champions, 1997) và Nghiên cứu Năng lực HR của Đại học Michigan & RBL Group.' },
    { q: 'Kết quả có dùng để đánh giá tuyển dụng không?',
      a: 'Công cụ này là một bản phản chiếu phong cách làm nghề, không phải bài đánh giá tuyển dụng hay tâm lý lâm sàng.' },
  ],
  gender: {
    title: 'Chọn nhân vật của bạn',            // Figma 3:5048
    lead: 'Để chân dung hợp với bạn hơn nhé.',
    options: [
      { id: 'female', label: 'Nữ',  img: 'assets/gender-female.webp', alt: 'Minh họa nhân vật nữ' },
      { id: 'male',   label: 'Nam', img: 'assets/gender-male.webp',   alt: 'Minh họa nhân vật nam' },
    ],
    next: 'Tiếp tục',
    back: 'Quay lại',
  },
  quiz: {
    step: 'Câu {n} / 06',            // n có 2 chữ số: 01…06
    back: 'Quay lại',
    next: 'Tiếp tục',
  },
  form: {
    eyebrow: 'Gần xong rồi!',
    title: 'Chân dung của bạn đã sẵn sàng',
    lead: 'Điền thông tin để nhận chân dung.',
    sendNote: 'Bản phân tích đầy đủ sẽ được gửi tới email này.',
    fields: {
      fullName: 'Họ và tên', email: 'Email', company: 'Công ty', companySize: 'Quy mô công ty',
      phone: 'Điện thoại/Zalo', jobTitle: 'Vai trò hiện tại',
    },
    placeholders: {
      fullName: 'Nguyễn Văn A', email: 'abc@congty.com', company: 'Tên công ty', phone: '0912 345 678',
    },
    sizePlaceholder: 'Chọn quy mô công ty',
    sizes: [['<50', 'Dưới 50 nhân sự'], ['50-200', '50–200 nhân sự'], ['200-1000', '200–1.000 nhân sự'], ['>1000', 'Trên 1.000 nhân sự']],
    rolePlaceholder: 'Chọn vai trò của bạn',
    // [MỞ] danh sách vai trò chờ Business chốt
    roles: ['Chuyên viên nhân sự', 'Tuyển dụng / Talent Acquisition', 'C&B / Payroll', 'Đào tạo / L&D', 'HR Business Partner', 'Trưởng / Phó phòng nhân sự', 'Giám đốc nhân sự / CHRO', 'Quản lý ngoài khối nhân sự', 'Khác'],
    errors: {
      email: 'Email chưa đúng định dạng, ví dụ ten@congty.vn.',
      fullName: 'Nhập họ và tên để lời chào trong email đúng tên bạn.',
      phone: 'Số điện thoại Việt Nam gồm 10 số, ví dụ 0912 345 678.',
      company: 'Nhập tên công ty.',
      jobTitle: 'Chọn vai trò hiện tại của bạn.',
    },
    back: 'Quay lại',
    submit: 'Xem chân dung của tôi',
    footnote: 'Bạn có thể yêu cầu gỡ bất cứ lúc nào.',
    demo: 'Điền dữ liệu mẫu',
  },
  result: {
    eyebrow: 'Chân dung HR của bạn',
    roleLine: 'Vai trò theo Ulrich/HRCS: {role}',
    combo: {                               // khối "bộ chân dung" (Figma 67:2161 · 67:2481 · 67:2830 · 67:3143)
      single: 'Chân dung nổi trội của bạn:',
      double: 'Chân dung kép',   // nhãn theo đặc tả 7.1
      multi: 'Chân dung đa diện',
      all6: 'Cả 6 chân dung xuất hiện ngang nhau trong câu trả lời của bạn.',
      tieNote: 'Khi hai chân dung bằng điểm nhau, hệ thống ưu tiên chân dung bạn chọn ở câu gần cuối nhất. Đây là quy tắc phân xử cố định, áp dụng như nhau cho mọi người chơi.',   // nguyên văn đặc tả 6.8
    },
    chartTitle: 'Phổ điểm 6 chân dung',
    chartSub: 'Mỗi câu trả lời cộng 1 điểm, tổng 6 điểm.',
    teaserTitle: 'Đây chỉ là bề nổi.',
    teaser: 'Một phân tích sâu 3 trang về năng lực lõi, góc khuất chiến lược và cách tìm mentor của bạn đang được gửi tới email của bạn.',
    skillsTitle: 'Kỹ năng nên phát triển',
    mentorTitle: 'Tìm mentor thế nào',
    stepTitle: 'Một bước nên đi tới',
    questionTitle: 'Câu hỏi mang về',
    questionArt: { DH: 'assets/question-DH.webp?v=6', KT: 'assets/question-KT.webp?v=8', TP: 'assets/question-TP.webp?v=6', GN: 'assets/question-GN.webp?v=6', GM: 'assets/question-GM.webp?v=6', TL: 'assets/question-TL.webp?v=6' },   // minh họa cho khối "Câu hỏi mang về" (Figma 281:3439 … 281:3453)
    teammateTitle: 'Đồng đội ăn ý',
    tcp: { eyebrow: 'Mảnh ghép chiến lược', title: 'Dành riêng cho bạn', cta: 'Tìm hiểu chương trình', url: 'https://talentconnectplus.edu.vn/' },
    brandCard: {
      desc: 'Nền tảng học tập ứng dụng tích hợp cố vấn, đào tạo và tư vấn. Built for Leaders. Rooted in Legacy.',
      badges: ['52 CEO đồng hành', 'Phương pháp UPWARDS™', 'Mạng lưới C-Sherpa'],
      programs: ['First Time Manager', 'HR Analytics for HR Managers', 'Phong Cách Làm Việc Tỉnh Thức', 'C-Sherpa: Apex · Next · Reset · Transform'],
      more: 'Khám phá thêm tại',
      site: 'talentconnectplus.edu.vn',
      contact: 'Hotline 0968 043 078 · support@talentconnectplus.edu.vn',
    },
    again: 'Làm lại bài trắc nghiệm',
    idle: 'Tự về trang chủ sau {s} giây',
    disclaimer: [
      'HR Persona Scanner là một trải nghiệm khám phá xu hướng hành vi, được lấy cảm hứng từ mô hình vai trò HR của Dave Ulrich (Human Resource Champions, 1997) và Nghiên cứu Năng lực HR của Đại học Michigan & RBL Group (HR Competency Study). Scanner sử dụng các tình huống và lựa chọn hành vi để phản ánh xu hướng làm việc nổi trội của người tham gia, thay vì đo lường năng lực, hiệu suất hay đặc điểm tâm lý.',
      'Khung đạo đức: Kết quả chỉ mang tính chất phản chiếu và gợi mở phát triển cá nhân, không phải là bài đánh giá tuyển dụng, đánh giá năng lực, trắc nghiệm tính cách chuẩn hóa hay công cụ tâm lý lâm sàng.',
    ],
    /* Nguồn tham khảo — nguyên văn đặc tả 10.1 (common.sources) */
    sourcesTitle: 'Nguồn tham khảo',
    sources: [
      'Ulrich, D. (1997). Human Resource Champions. Harvard Business School Press.',
      'Ulrich, D. et al. (2017). Victory Through Organization (HR Competency Study, Round 7). RBL Group & University of Michigan.',
      'Costa, P. T., & McCrae, R. R. (1992). Revised NEO Personality Inventory (Five-Factor Model).',
    ],
    /* Bộ chọn nhanh để duyệt 10 trường hợp kết quả — công cụ nội bộ (xem CONFIG.DEV_TOOLS). */
    picker: { button: 'Xem nhanh kết quả', title: 'Chọn trường hợp kết quả', single: 'Chân dung rõ nét', double1: 'Kép · 1 chính 1 phụ', double2: 'Kép · 2 bằng điểm', multi3: 'Đa diện · 3 bằng điểm', multi6: 'Đa diện · 6 bằng điểm' },
  },
  reset: {
    button: 'Lượt mới',
    title: 'Bỏ lượt đang làm?',
    desc: 'Các câu bạn đã trả lời trong lượt này sẽ bị xoá. Người tiếp theo sẽ bắt đầu từ trang chủ.',
    confirm: 'Bỏ lượt này',
    cancel: 'Tiếp tục làm',
  },
  footer: '© 2026 Talent Connect Plus · {event}',
  ethics: 'Công cụ này là một bản phản chiếu phong cách làm nghề, không phải bài đánh giá tuyển dụng hay tâm lý lâm sàng.',
  styleguide: 'Styleguide',
  devNote: '(chỉ dùng cho preview UI)',   // ghi chú cạnh 2 nút công cụ preview
};

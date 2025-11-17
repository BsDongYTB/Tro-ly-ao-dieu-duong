import { GoogleGenerativeAI } from "@google/generative-ai";

// Load API Key từ Netlify Environment Variables
const apiKey = process.env.GEMINI_API_KEY;

// Khởi tạo client
let ai;
if (apiKey) {
    ai = new GoogleGenerativeAI(apiKey);
} else {
    console.error("GEMINI_API_KEY is not set in Netlify Environment Variables.");
}

// =================================================================
// DỮ LIỆU CƠ SỞ KIẾN THỨC TỪ FILE WORD
// =================================================================
const KNOWLEDGE_BASE_DATA = `
TÀI LIỆU TƯ VẤN – TRUYỀN THÔNG: CHĂM SÓC NGƯỜI BỆNH SAU PHẪU THUẬT
Mục đích: Cung cấp hướng dẫn chuẩn cho người bệnh và người nhà về chuẩn bị trước phẫu thuật, chăm sóc sau phẫu thuật và các dấu hiệu cần tái khám/ cấp cứu.
---
I. Chuẩn bị người bệnh trước phẫu thuật:
1. Cung cấp thông tin: Tiền sử bệnh mạn tính, thuốc đang dùng (chống đông, tiểu đường, tim mạch), tiền sử dị ứng.
2. Nhịn ăn uống (NPO): Thường 6 giờ trước mổ với thức ăn rắn, 2 giờ đối với nước.
3. Kiểm tra xét nghiệm: Điện tim, X-quang, siêu âm nếu cần.
4. Ngưng/Điều chỉnh thuốc: Thuốc chống đông, aspirin, thuốc giảm miễn dịch... theo chỉ định Bác sĩ.
5. Vệ sinh trước mổ: Tắm rửa bằng xà phòng khử khuẩn (CHG 4%) trong vòng 12-24 giờ trước mổ. Chú ý các vùng nách, háng, mông, và quanh vị trí phẫu thuật. **Không** sử dụng kem dưỡng da, dầu thơm. **Tránh cạo lông** tại vị trí phẫu thuật.
6. Ký cam đoan: NB/ người đại diện ký cam đoan đồng ý phẫu thuật.
II. Chăm sóc sau phẫu thuật
1. Hướng dẫn Chế độ dinh dưỡng:
    - 1.1. Nguyên tắc chung: Ăn từ lỏng → đặc → mềm → bình thường. Ưu tiên ít dầu mỡ – ít gia vị – dễ tiêu. Tránh thức ăn gây đầy hơi.
    - 1.2. Chế độ ăn sau mổ bệnh Ngoại tiêu hóa (ruột thừa, đại tràng, dạ dày, túi mật…):
        - Hướng dẫn chung: Theo dõi trung tiện, đại tiện. Tránh thức ăn sinh hơi (Đậu nành, nước có ga, đồ chiên rán, rau sống). Chia nhỏ 5–6 bữa/ngày.
        - Ngày 1–2 sau mổ: Nhấp vài ngụm nước lọc (sau khi tỉnh, không buồn nôn). Sau 6 tiếng: ăn cháo loãng, súp loãng. Tránh sữa và đồ ngọt khi bụng rỗng.
        - Ngày 3–5 sau mổ: Cháo/súp đặc hơn, cơm nát, trứng hấp, cá hấp, thịt nạc băm, rau củ nấu mềm (bí đỏ, cà rốt).
        - Sau 5 ngày trở đi: Quay dần về bình thường. Tăng đạm (cá, tôm, thịt nạc). Uống đủ nước 1.5–2 l/ngày.
        - Thực phẩm nên tránh (2 tuần đầu): Đồ nếp, rau sống, dưa/cà muối, cay nóng, dầu mỡ, nước có ga, cà phê, rượu bia.
    - 1.3. Chế độ ăn sau mổ bệnh Ngoại tiết niệu (sỏi thận, bàng quang…):
        - Hướng dẫn chung: Uống đủ nước (2–2.5 l/ngày trừ khi có hạn chế) để tăng bài tiết, hạn chế tái hình thành sỏi. Giảm muối, giảm đạm động vật nếu có tiền sử sỏi.
        - Ngày 1–2 sau mổ: Cháo loãng, súp loãng (sau 4-6 tiếng). Uống nhiều nước chia nhiều lần.
        - Sau 5 ngày trở đi: Bổ sung trái cây giàu vitamin C (cam, bưởi). Hạn chế: Thịt đỏ, nội tạng, thức ăn quá mặn, trà đặc, cà phê, dưa/cà/măng muối.
        - Nếu có đặt sonde/ống dẫn lưu: Uống nước rải đều, tránh đồ nhuộm màu đậm.
    - 1.4. Chế độ ăn sau mổ bệnh Ngoại chấn thương (Cột sống, kết hợp xương, thay khớp…):
        - Mục tiêu: Tăng đạm, canxi, vitamin D, kẽm giúp liền xương – liền mô. Tránh tăng cân.
        - Thực phẩm tốt: Đạm (thịt gà, cá hồi, trứng), Canxi (sữa, phô mai), Vitamin D (ánh nắng).
    - Lưu ý chung: Ăn chậm – nhai kỹ. Tránh ăn quá no. Không tự ý dùng men tiêu hóa, kháng sinh. Báo điều dưỡng nếu buồn nôn, chướng bụng, sốt, nôn nhiều, bí trung đại tiện.
2. HƯỚNG DẪN VẬN ĐỘNG & PHỤC HỒI CHỨC NĂNG:
    - Mục tiêu: Giảm nguy cơ huyết khối tĩnh mạch sâu (DVT), tăng nhu động ruột, giảm đau, tăng thông khí phổi, tăng tốc độ phục hồi.
    - Ngoại tiêu hóa: Vận động sớm nhất có thể. Giai đoạn 0–24 giờ: Tập thở sâu, ho khạc có hỗ trợ, cử động chân, nghiêng trở mình. Ngày 2–3: Ngồi dậy mép giường, đi lại nhẹ trong phòng. Sau 7 ngày: Đi bộ 20–30 phút. **Tránh:** Gập người mạnh, nâng vật nặng 4–6 tuần.
    - Ngoại tiết niệu: Uống nước rải đều, tránh đồ nhuộm màu đậm. Giữ túi dẫn lưu thấp hơn bàng quang. Vận động theo chỉ định.
    - Ngoại chấn thương: Mức độ vận động phụ thuộc chỉ định bác sĩ. Ưu tiên: giảm đau – tập chủ động sớm – ngừa teo cơ. Sau thay khớp háng: **Tránh** gập háng quá 90°, khép chân qua đường giữa, xoay trong mạnh (trong 6 tuần). Sau mổ cột sống: **Không** cúi – xoay – vặn người trong 6 tuần. Luôn đeo đai theo hướng dẫn.
3. Chăm sóc vết mổ: Giữ sạch, khô. Không tự bóc vết mổ. Điều dưỡng thay băng hoặc hướng dẫn thay băng tại cơ sở y tế. **Quan sát:** Đỏ, sưng, rỉ dịch, mùi hôi, đau tăng là dấu hiệu cảnh báo.
4. Chăm sóc ống dẫn lưu: Giữ cố định. Theo dõi lượng dịch. Không rút ống khi chưa có chỉ định.
5. Dùng thuốc: Theo đơn: giảm đau, kháng sinh, chống đông. Ghi nhớ lịch uống, báo nếu dị ứng.
6. Theo dõi diễn biến: Theo dõi nhiệt độ, mức độ đau, tiêu hóa, dịch vết mổ. **Báo ngay** nếu sốt ≥ 38°C kèm rét run, đau tăng, bụng căng cứng, nôn nhiều, vết mổ chảy máu/rỉ dịch mủ.
7. Liên hệ hỗ trợ: Bấm chuông bệnh/ Gọi Điều dưỡng trực khoa/ Hotline: 0913570808.
`;

// =================================================================
// BỘ QUY TẮC VÀ VAI TRÒ CHUYÊN SÂU
// =================================================================
const ENHANCED_SYSTEM_INSTRUCTION = `
Bạn là Trợ lý Ảo Điều Dưỡng Hậu Phẫu (AI Nurse Assistant) của Bệnh viện.
Mục tiêu: Hỗ trợ người bệnh và thân nhân tra cứu, theo dõi và cảnh báo tình trạng sau phẫu thuật an toàn, chính xác, nhân văn.

🧭 1. CHỨC NĂNG VÀ NGUYÊN TẮC:
- Căn cứ trả lời: **CHỈ** dựa trên "DỮ LIỆU CƠ SỞ KIẾN THỨC VỀ CHĂM SÓC SAU PHẪU THUẬT" được cung cấp.
- Nếu thông tin **KHÔNG CÓ** trong tài liệu: Phải trả lời **ngay lập tức** bằng [Tiêu đề + Biểu tượng] "Nội dung này cần điều dưỡng trực kiểm tra trực tiếp để đảm bảo an toàn." và chuyển sang luồng HƯỚNG DẪN HÀNH ĐỘNG KHẨN CẤP. **KHÔNG ĐƯỢC PHÉP** tìm kiếm trên web.
- Giải thích: Phải dễ hiểu, tránh thuật ngữ y học phức tạp.
- Dấu hiệu nguy hiểm: Nhận diện các dấu hiệu nghi ngờ biến chứng (sốt ≥38°C, chảy máu, rỉ dịch mủ, đau tăng nhanh, khó thở) để chuyển sang luồng CẢNH BÁO.
- Tính nhân văn: Giữ giọng nhẹ nhàng, chuyên nghiệp, không gây hoang mang.
- Luôn kết thúc bằng số điện thoại hỗ trợ (0913570808).

🩹 2. QUY TẮC XỬ LÝ ĐỘC QUYỀN CỦA TRỢ LÝ ẢO ĐIỀU DƯỠNG:
A. PHÂN LOẠI TRIAGE (Ưu tiên):
    - Nếu câu hỏi chứa DẤU HIỆU NGUY HIỂM (sốt ≥38°C, chảy máu, rỉ dịch mủ, đau tăng nhanh, khó thở): BỎ QUA kiểm tra thông tin. Chuyển ngay sang luồng CẢNH BÁO.
    - Nếu câu hỏi nằm NGOÀI PHẠM VI DỮ LIỆU CƠ SỞ (vd: "Tôi truyền hết dịch rồi", "Tôi thấy tê chân", "Tôi bị đau nhiều", "Tôi chưa đi tiêu được"): Chuyển sang luồng NGOÀI PHẠM VI.
    - Các câu hỏi còn lại: Áp dụng luồng KIỂM TRA THÔNG TIN.

B. LUỒNG KIỂM TRA THÔNG TIN (Áp dụng cho các câu hỏi chăm sóc thông thường):
    - Kiểm tra 3 thông tin BẮT BUỘC: (1) loại phẫu thuật, (2) ngày hậu phẫu, (3) nội dung/triệu chứng cần hỗ trợ.
    - Nếu THIẾU thông tin: Trả lời bằng CÂU HỎI LẠI NGẮN GỌN (không đoán, không suy diễn) về thông tin còn thiếu.
    - Nếu ĐỦ thông tin: Sử dụng tài liệu chuyên môn để trả lời theo ĐỊNH DẠNG TRẢ LỜI.
    - Nếu người bệnh không trả lời sau 2 lần hỏi lại (trong lịch sử chat): Gửi HƯỚNG DẪN AN TOÀN.

C. LUỒNG CẢNH BÁO (Dấu hiệu nguy hiểm):
    - 1. Hỏi Consent (Đồng ý): Hỏi người bệnh/thân nhân "Để chúng tôi có thể gửi cảnh báo đến điều dưỡng trực, bạn có đồng ý chia sẻ thông tin này không? (Trả lời: ĐỒNG Ý / KHÔNG)".
    - 2. Nếu ĐỒNG Ý: **Tạo payload JSON Alert** chứa thông tin nguy hiểm (dạng mô phỏng) và chuyển sang HƯỚNG DẪN HÀNH ĐỘNG KHẨN CẤP.
    - 3. Nếu KHÔNG ĐỒNG Ý: Chuyển sang HƯỚNG DẪN HÀNH ĐỘNG KHẨN CẤP.

D. LUỒNG NGOÀI PHẠM VI (Dữ liệu chưa đủ hoặc cần can thiệp trực tiếp):
    - Trả lời bằng [Tiêu đề + Biểu tượng] "Nội dung này cần điều dưỡng trực kiểm tra trực tiếp để đảm bảo an toàn." và gửi HƯỚNG DẪN HÀNH ĐỘNG KHẨN CẤP.

E. ĐỊNH DẠNG TRẢ LỜI CÁC LUỒNG:
    - 1️⃣ CÂU MỞ ĐẦU CHUẨN: "Xin chào, tôi là Trợ lý Ảo Điều Dưỡng của Bệnh viện 👩‍⚕️" (Sử dụng cho tin nhắn trả lời đầu tiên).
    - 2️⃣ ĐỊNH DẠNG TRẢ LỜI THÔNG THƯỜNG (Sau khi đủ 3 thông tin):
        - Tiêu đề: 🩹 [Tên nội dung, ví dụ: “Chăm sóc vết mổ sau phẫu thuật”]
        - Nội dung: Vài gạch đầu dòng hướng dẫn cụ thể dựa trên tài liệu.
        - Cảnh báo: ⚠️ Nếu có dấu hiệu bất thường như đau tăng, sốt ≥38°C hoặc vết mổ rỉ dịch, hãy báo điều dưỡng trực ngay.
        - Kết thúc: "Ấn chuông gọi nhân viên y tế trong phòng bệnh / Hoặc ấn nút gọi hotline (0913570808)."
    - 3️⃣ HƯỚNG DẪN HÀNH ĐỘNG KHẨN CẤP (Dành cho luồng Cảnh báo và Ngoài Phạm vi):
        - Nêu rõ: "Vui lòng liên hệ ngay điều dưỡng để được hỗ trợ và theo dõi."
        - Kết thúc: "Ấn chuông gọi nhân viên y tế trong phòng bệnh / Hoặc ấn nút gọi hotline (0913570808)."

F. ĐỊNH DẠNG JSON ALERT (Mô phỏng):
    - Dạng code block Markdown (json) khi đồng ý cảnh báo:
        \`\`\`json
        {
          "alert_type": "HIGH_PRIORITY",
          "user_id": "[Tạo một ID mô phỏng]",
          "symptoms_reported": "[Các triệu chứng người bệnh báo cáo]",
          "recommendation": "Can thiệp trực tiếp ngay lập tức",
          "contact_request": "Người bệnh đã đồng ý chia sẻ thông tin"
        }
        \`\`\`

---
`;

/**
 * Netlify Function handler
 */
exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }

    if (!ai) {
        return { statusCode: 500, body: JSON.stringify({ error: "API Key not found" }) };
    }

    try {
        const { message, history } = JSON.parse(event.body);

        const contextMessage = {
            role: "user",
            parts: [{
                text: `
${ENHANCED_SYSTEM_INSTRUCTION}

--- DỮ LIỆU CƠ SỞ CHĂM SÓC SAU PHẪU THUẬT ---
${KNOWLEDGE_BASE_DATA}
                `
            }]
        };

        const contents = [
            contextMessage,
            ...history.slice(1)
        ];

        // Gọi Gemini API
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        const response = await model.generateContent({
            contents
        });

        const result = response.response.text() || "Không thể tạo phản hồi lúc này.";

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: result })
        };

    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

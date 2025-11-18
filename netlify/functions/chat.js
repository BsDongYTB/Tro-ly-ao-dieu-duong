// netlify/functions/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ============================================================
   0. HÀM TRÍCH XUẤT TEXT AN TOÀN CHO GEMINI
   ============================================================ */
function extractGeminiText(resp) {
  if (!resp) return "";

  try {
    const fn = resp.response?.text;
    if (typeof fn === "function") return fn();
  } catch {}

  try {
    if (typeof resp.response?.text === "string") return resp.response.text;
  } catch {}

  try {
    return resp.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {}

  return "";
}

/* ============================================================
   1. TÀI LIỆU CHĂM SÓC SAU PHẪU THUẬT – ĐÃ DÁN NGUYÊN VĂN FILE WORD
   ============================================================ */
const KNOWLEDGE_BASE = `
TÀI LIỆU TƯ VẤN – TRUYỀN THÔNG: CHĂM SÓC NGƯỜI BỆNH SAU PHẪU THUẬT
Mục đích: Tài liệu này cung cấp hướng dẫn chuẩn cho người bệnh và người nhà về chuẩn bị trước phẫu thuật, chăm sóc sau phẫu thuật và các dấu hiệu cần tái khám/ cấp cứu. Người bệnh cần tuân thủ hướng dẫn của bác sĩ và điều dưỡng. Trong mọi trường hợp khẩn cấp, hãy liên hệ ngay điều dưỡng trực hoặc đến cơ sở y tế gần nhất.

I. Chuẩn bị người bệnh trước phẫu thuật:

1. Cung cấp thông tin về tiền sử: Bệnh mạn tính, thuốc đang dùng (thuốc chống đông, thuốc tiểu đường, thuốc tim mạch), tiền sử dị ứng, … 

2. Nhịn ăn uống (NPO): thường 6 trước mổ với thức ăn rắn, 2 giờ đối với nước và theo chỉ định của Bác sĩ trong một số tình huống nhất định.

3. Kiểm tra xét nghiệm, điện tim, X-quang, siêu âm nếu cần theo yêu cầu cuộc mổ.

4. Thực hiện ngưng/điều chỉnh một số thuốc theo hướng dẫn: thuốc chống đông, aspirin, thuốc làm giảm miễn dịch... theo chỉ định của Bác sĩ.

5. Vệ sinh trước mổ: Tắm rửa bằng xà phòng khử khuẩn, cắt móng tay, tháo trang sức: 

- Chuẩn bị vật dụng: Gồm khăn sạch, dung dịch tắm, bông tắm và áo choàng phẫu thuật (do bệnh viện cung cấp)

-  Quá trình tắm:

+ Thời điểm tắm: Tắm trong vòng 12-24 giờ trước ca phẫu thuật, thường là vào buổi tối trước ngày phẫu thuật.

+ Tắm sạch cơ thể: Sử dụng dung dịch sát khuẩn CHG 4% để làm sạch toàn bộ cơ thể, chú ý các vùng da quanh vị trí phẫu thuật.

+ Thứ tự tắm:

	Đầu tiên làm ướt cơ thể bằng nước ấm.
	Thoa dung dịch tắm lên da, không pha loãng, bắt đầu từ cổ trở xuống.
	Đặc biệt chú ý làm sạch kỹ các vùng da dễ bị nhiễm khuẩn như nách, háng, mông, và quanh vị trí phẫu thuật.
	Xoa kỹ dung dịch lên da ít nhất 2 phút.

+ Rửa sạch: Sau khi xoa dung dịch, rửa sạch cơ thể bằng nước ấm.

+ Lau khô: Dùng khăn sạch lau khô toàn bộ cơ thể.

+ Mặc quần áo sạch: Sau khi tắm, người bệnh cần mặc quần áo sạch và giữ vệ sinh cơ thể trước phẫu thuật.

Chú ý quan trọng:
- Không sử dụng kem dưỡng da, dầu thơm sau khi tắm sát khuẩn.
- Không cạo lông vùng phẫu thuật.
- Tránh tiếp xúc hóa chất với mắt – tai – miệng.

6. Nghe bác sĩ giải thích, ký cam đoan phẫu thuật.

7. Nếu chưa hiểu rõ: Gặp nhân viên y tế hỗ trợ.

---------------------------------------------------------------
II. CHĂM SÓC SAU PHẪU THUẬT

1. CHẾ ĐỘ DINH DƯỠNG

1.1. Nguyên tắc chung
- Ăn từ lỏng → đặc → mềm → bình thường.
- Hạn chế dầu mỡ, gia vị mạnh.
- Tránh thức ăn dễ gây đầy hơi: đồ chiên, nước có ga, đồ nếp, đậu…

1.2. Sau mổ ngoại tiêu hóa (ruột thừa, đại tràng, túi mật…)
Ngày 1–2:
- Nhấp nước lọc khi tỉnh, không buồn nôn.
- 6 giờ sau mổ → ăn cháo/súp loãng.
- Tránh uống sữa khi bụng rỗng.

Ngày 3–5:
- Cháo đặc, cơm nát, trứng hấp, cá hấp.
- Rau mềm: bí đỏ, cà rốt, khoai tây.

Sau 5 ngày:
- Ăn gần bình thường.
- Tăng đạm: cá, tôm, thịt nạc.
- Uống 1.5–2 lít nước/ngày.

1.3. Sau mổ tiết niệu (sỏi thận, niệu quản…)
- Uống đủ nước 2–2.5 l/ngày (trừ khi bác sĩ hạn chế)
- Tránh đồ uống màu đậm nếu có dẫn lưu.
- Hạn chế: thịt đỏ, nội tạng, đồ mặn, đồ uống kích thích.

1.4. Sau mổ chấn thương (cột sống, thay khớp…)
- Tăng đạm, canxi, vitamin D.
- Không tăng cân nhanh.
- Gợi ý: gà, cá hồi, sữa ít béo, phô mai, trứng.

1.5. Lưu ý chung:
- Ăn chậm nhai kỹ.
- Không tự ý dùng men tiêu hóa – thuốc xổ.
- Nếu chướng bụng kéo dài → báo điều dưỡng.

---------------------------------------------------------------
2. VẬN ĐỘNG – PHỤC HỒI CHỨC NĂNG
- Ngày đầu: thở sâu, cử động chân tay, trở mình.
- Ngày 2–3: ngồi dậy – đi lại nhẹ.
- Tránh gập người mạnh, nâng nặng 4–6 tuần.

Sau thay khớp háng:
- Tránh gập háng > 90°, khép chân qua đường giữa.

Sau mổ cột sống:
- Không cúi – xoay – vặn 6 tuần.
- Đeo đai theo chỉ định.

---------------------------------------------------------------
3. CHĂM SÓC VẾT MỔ
- Giữ khô, sạch.
- Không tự bóc băng.
- Theo dõi: đỏ – sưng – rỉ dịch – mùi hôi → báo ngay.
---------------------------------------------------------------
4. DẤU HIỆU CẢNH BÁO
- Sốt ≥ 38°C
- Bụng căng – đau tăng nhanh
- Nôn nhiều
- Vết mổ rỉ dịch mủ
- Khó thở, ngất, tím tái

---------------------------------------------------------------
5. LIÊN HỆ KHẨN CẤP
- Điều dưỡng trực tại khoa
- Hotline: 091357080
---------------------------------------------------------------
`;

/* ============================================================
   2. PROMPT PHÂN TÍCH CÂU HỎI → JSON
   ============================================================ */
const PARSER_SYSTEM_PROMPT = `
Bạn là bộ phân tích câu hỏi hậu phẫu.
Nhiệm vụ:
- Phát hiện 3 thông tin: "surgery", "postOpDay", "symptom"
- Nếu không có → trả "null"
- Tạo mảng "missing"

CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH:

{
 "surgery": string | null,
 "postOpDay": number | null,
 "symptom": string | null,
 "missing": []
}
`;

/* ============================================================
   3. PROMPT TẠO CÂU TRẢ LỜI
   ============================================================ */
const ANSWER_SYSTEM_PROMPT = `
Bạn là Trợ lý Ảo Điều Dưỡng Hậu Phẫu của bệnh viện.

YÊU CẦU:
- Giọng nhẹ nhàng – nhân văn – dễ hiểu.
- Không dùng thuật ngữ chuyên sâu.
- Không chẩn đoán – không suy đoán.
- Chỉ dùng thông tin từ tài liệu.

CẤU TRÚC TRẢ LỜI:
1) **Tiêu đề**
2) **Các gạch đầu dòng hướng dẫn cụ thể**
3) **Kết thúc bắt buộc**:
" Nếu có vấn đề khẩn cấp vui lòng liên hệ hotline: 091357080.
  Ấn chuông gọi nhân viên y tế trong phòng bệnh / Hoặc ấn nút gọi hotline (091357080)."

NẾU TÀI LIỆU KHÔNG CÓ THÔNG TIN → TRẢ:
"Vui lòng gọi điều dưỡng trực kiểm tra trực tiếp để đảm bảo an toàn hoặc gọi hotline 091357080."
`;

/* ============================================================
   4. HỎI BỔ SUNG THÂN THIỆN
   ============================================================ */
function buildFriendlyMissingMessage(missing) {
  const msgs = [];
  if (missing.includes("surgery"))
    msgs.push("Bạn vui lòng cho mình biết bạn đã phẫu thuật gì ạ?");
  if (missing.includes("postOpDay"))
    msgs.push("Bạn đang ở ngày thứ mấy sau phẫu thuật rồi ạ?");
  if (missing.includes("symptom"))
    msgs.push("Hiện tại bạn đang gặp triệu chứng gì hoặc cần hỗ trợ điều gì không ạ?");
  return msgs.join(" ");
}

function countAsks(history) {
  return history.filter(m => m.role === "assistant" && m.tag === "ASK_MISSING").length;
}

/* ============================================================
   5. HANDLER CHÍNH
   ============================================================ */
export const handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  if (!process.env.GEMINI_API_KEY)
    return { statusCode: 500, body: "Missing GEMINI_API_KEY" };

  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  const body = JSON.parse(event.body || "{}");
  const userMessage = body.message || "";
  const history = body.history || [];

  /* ============================================================
       STEP 1 — PHÂN TÍCH
     ============================================================ */
  const parseResult = await model.generateContent({
    contents: [
      { role: "system", parts: [{ text: PARSER_SYSTEM_PROMPT }] },
      { role: "user", parts: [{ text: userMessage }] }
    ]
  });

  let parsed = {};
  try {
    const raw = extractGeminiText(parseResult)
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    parsed = JSON.parse(raw);
  } catch {
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: "Xin lỗi, mình chưa hiểu rõ câu hỏi. Bạn nói lại giúp mình được không ạ?"
      })
    };
  }

  const missing = parsed.missing || [];
  const askCount = countAsks(history);

  /* ============================================================
       STEP 1B – HỎI BỔ SUNG THÔNG TIN
     ============================================================ */
  if (missing.length > 0) {
    if (askCount >= 2) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply:
            "Tôi không nhận đủ thông tin để có thể trả lời, vui lòng gọi điều dưỡng trực kiểm tra trực tiếp hoặc gọi hotline 091357080."
        })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: buildFriendlyMissingMessage(missing),
        tag: "ASK_MISSING"
      })
    };
  }

  /* ============================================================
       STEP 2 — TRẢ LỜI
     ============================================================ */
  const answerResult = await model.generateContent({
    contents: [
      { role: "system", parts: [{ text: ANSWER_SYSTEM_PROMPT }] },
      { role: "system", parts: [{ text: "Dữ liệu nội bộ:\n" + KNOWLEDGE_BASE }] },
      {
        role: "user",
        parts: [
          {
            text: `
THÔNG TIN NGƯỜI BỆNH:

- Phẫu thuật: ${parsed.surgery}
- Ngày hậu phẫu: ${parsed.postOpDay}
- Triệu chứng: ${parsed.symptom}

Vui lòng trả lời đúng cấu trúc yêu cầu.`
          }
        ]
      }
    ]
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      reply: extractGeminiText(answerResult)
    })
  };
};

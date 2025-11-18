// netlify/functions/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";
// Hàm đọc bất kỳ dạng text nào mà Gemini trả về
function extractGeminiText(resp) {
  if (!resp) return "";

  // SDK mới: response.text() là function
  try {
    const fn = resp.response?.text;
    if (typeof fn === "function") {
      return fn();
    }
  } catch {}

  // SDK cũ: response.text là string
  try {
    if (typeof resp.response?.text === "string") {
      return resp.response.text;
    }
  } catch {}

  // SDK cũ hơn: candidates[]
  try {
    return resp.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {}

  return "";
}


/* ============================================================
   1. TÀI LIỆU KIẾN THỨC (NGUYÊN VĂN TỪ FILE WORD BẠN ĐÃ CUNG CẤP)
   ============================================================ */
const KNOWLEDGE_BASE = `
(TÀI LIỆU TƯ VẤN – TRUYỀN THÔNG: CHĂM SÓC NGƯỜI BỆNH SAU PHẪU THUẬT
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

Chú ý quan trọng

+ Không sử dụng các sản phẩm khác: Không sử dụng kem dưỡng da, dầu thơm, hoặc các sản phẩm làm đẹp khác sau khi tắm bằng dung dịch CHG vì có thể làm giảm hiệu quả của thuốc sát khuẩn.

+ Tránh tiếp xúc với mắt, tai và miệng: Dung dịch CHG không nên tiếp xúc với các vùng nhạy cảm này.

+ Không cạo lông: Tránh cạo lông tại vị trí phẫu thuật trước khi tắm vì việc này có thể làm tổn thương da và tăng nguy cơ nhiễm khuẩn.

6. Nghe Bác sĩ giải thích tình trạng bệnh và phương pháp mổ, giải đáp thắc mắc. 

7. NB/ người đại diện ký cam đoan đồng ý phẫu thuật

8. Nếu còn vấn đề gì chưa hiểu rõ: Gặp nhân viên y tế để được hỗ trợ. 

II. Chăm sóc sau phẫu thuật

1. Hướng dẫn Chế độ dinh dưỡng:

1.1. Nguyên tắc chung:

Ăn từ lỏng → đặc → mềm → bình thường.

Ưu tiên ít dầu mỡ – ít gia vị – dễ tiêu.

Tránh thức ăn gây đầy hơi, khó tiêu, kích thích co bóp mạnh.

1.2. Chế độ ăn sau mổ bệnh Ngoại tiêu hóa: (ruột thừa, đại tràng, dạ dày, túi mật…)

a. Hướng dẫn chung

- Theo dõi trung tiện, đại tiện (đi ngoài) để quyết định tăng khẩu phần.

- Tránh thức ăn sinh hơi như Đậu nành, nước có ga, đồ chiên rán, rau sống, …

- Ưu tiên thực phẩm ít xơ – dễ hấp thu trong giai đoạn đầu.

- Chia nhỏ khẩu phần 5–6 bữa/ngày.

b. Chế độ ăn theo giai đoạn

Ngày 1 –2 sau mổ

Sau khi tỉnh hoàn toàn, không buồn nôn có thể nhấp vài ngụm nước lọc. 

Sau mổ khoảng 6 tiếng có thể ăn cháo loãng, súp loãng 

Tránh uống sữa và đồ ngọt khi bụng rỗng vì dễ gây chướng bụng.

Ngày 3–5 sau mổ

Cháo/ súp đặc hơn, cơm nát, 

Trứng hấp, cá hấp, thịt nạc băm,

Rau củ nấu mềm (bí đỏ, cà rốt, khoai tây, …...)

Sau 5 ngày trở đi

Quay dần về chế độ ăn bình thường.

Ăn tăng đạm: cá, tôm, thịt nạc, đậu phụ.

Bổ sung hoa quả và rau xanh để tăng cường vitamin. 

Uống đủ nước 1.5–2 l/ngày, tránh rượu bia và thức ăn nhiều dầu.

c. Những thực phẩm nên tránh (trong 2 tuần đầu)

- Đồ nếp, rau sống, dưa/cà muối.

- Thức ăn cay nóng, nhiều dầu mỡ.

- Nước có ga, cà phê, rượu bia.

- Các loại đậu gây đầy hơi.

1.3. Chế độ ăn sau mổ bệnh Ngoại tiết niệu (sỏi thận, bàng quang, niệu quản, tuyến tiền liệt…)

a. Hướng dẫn chung

- Uống đủ nước để tăng bài tiết, hạn chế tái hình thành sỏi.

- Giảm muối, giảm đạm động vật nếu có tiền sử sỏi.

- Tránh chất kích thích gây kích ứng bàng quang.

b. Chế độ ăn theo giai đoạn

Ngày 1–2 sau mổ

Sau khi tỉnh hoàn toàn, không buồn nôn có thể nhấp vài ngụm nước lọc. 

Sau mổ khoảng 4 - 6 tiếng có thể ăn cháo loãng, súp loãng.

Uống nhiều nước chia nhiều lần (1 cốc nhỏ mỗi 1–2 giờ).

Ngày 3–5

Cháo đặc, cơm mềm, thịt nạc, cá hấp.

Các loại hoa quả, rau xanh, các loại củ (khoai lang, khoai tây, cà rốt, …)

Tăng dần lượng nước: 2–2.5 l/ngày (trừ khi bác sĩ hạn chế).

Sau 5 ngày trở đi

Bổ sung trái cây giàu vitamin C (cam, bưởi, ổi).

Hạn chế: Thịt đỏ quá nhiều, Các loại nội tạng, Thức ăn quá mặn, Trà đặc – cà phê, nước có ga, dưa/cà/ măng muối, ...

c. Nếu có đặt sonde/ống dẫn lưu tiết niệu

- Uống nước rải đều suốt ngày.

- Tránh đồ nhuộm màu đậm (cola, nước tăng lực) → khó theo dõi nước tiểu.

1.4. Chế độ ăn sau mổ bệnh Ngoại chấn thương (Cột sống, kết hợp xương, thay khớp háng/khớp gối…)

a. Mục tiêu dinh dưỡng

- Tăng đạm, canxi, vitamin D, kẽm giúp liền xương – liền mô.

- Tránh tăng cân nhanh (do ít vận động).

b. Gợi ý các nhóm thực phẩm tốt

- Giàu đạm: thịt gà, cá hồi, tôm, thịt nạc, trứng.

- Giàu Canxi: sữa ít béo, phô mai, sữa chua, cải bó xôi.

- Giàu Vitamin D: trứng, cá ngừ, ánh nắng sáng 10–15 phút/ngày.

- Tăng cường mô liên kết: nước hầm xương, gelatin, collagen.

c. Giai đoạn ăn uống

Ngày 1–2

Sau khi tỉnh hoàn toàn, không buồn nôn có thể nhấp vài ngụm nước lọc. 

Sau mổ khoảng 4 - 6 tiếng có thể ăn cháo loãng, súp loãng.

Uống đủ nước 1.5–2 l/ngày.

Ngày 3–7

Cháo đặc, cơm mềm, thịt nạc băm.

Bổ sung đạm 70–100 g/ngày.

Thêm rau củ mềm: bí đỏ, khoai tây, cà rốt, …

Sau 7 ngày trở đi

Ăn bình thường, ưu tiên đạm chất lượng cao.

Chia 4–5 bữa nhỏ để tránh tăng cân.

Hạn chế: thức ăn nhanh, đồ chiên rán, nước ngọt có gas.

1.5. Lưu ý chung cho tất cả người bệnh sau mổ

- Ăn chậm – nhai kỹ.

- Tránh ăn quá no.

- Không tự ý dùng men tiêu hóa, kháng sinh, thuốc xổ.

- Nếu buồn nôn, chướng bụng kéo dài → cần báo điều dưỡng.

- Nếu sốt, nôn nhiều, bí trung đại tiện → đến bệnh viện ngay.

2. HƯỚNG DẪN VẬN ĐỘNG & PHỤC HỒI CHỨC NĂNG SAU PHẪU THUẬT

... (NỘI DUNG PHẦN VẬN ĐỘNG, CHĂM SÓC VẾT MỔ, DẤU HIỆU CẢNH BÁO, LIÊN HỆ, ... GIỮ NGUYÊN NHƯ FILE) ...

7. Dấu hiệu cảnh báo cần tái khám/ cấp cứu:

- Sốt ≥ 38°C kèm rét run.

- Đau tăng, bụng căng cứng, nôn nhiều.

- Vết mổ chảy máu nhiều, rỉ dịch mủ hoặc có mùi hôi.

- Khó thở, tím tái, ngất hoặc lú lẫn.TIẾT KIỆM KHÔNG GỬI HẾT Ở ĐÂY — bạn hãy dán toàn bộ nội dung Word nguyên văn vào phần này)
`;

/* ============================================================
   2. INSTRUCTION CHO BƯỚC 1: PHÂN TÍCH CÂU HỎI → JSON
   ============================================================ */
const PARSER_SYSTEM_PROMPT = `
Bạn là trợ lý phân tích câu hỏi hậu phẫu. 
Nhiệm vụ của bạn:

1. Đọc câu hỏi của người bệnh.
2. Trích xuất 3 thông tin quan trọng:
   - "surgery": loại phẫu thuật (nếu có)
   - "postOpDay": ngày thứ mấy sau phẫu thuật (nếu có)
   - "symptom": triệu chứng hoặc nhu cầu hỗ trợ người bệnh đang hỏi
3. Nếu người bệnh nói chung chung như “cần chăm sóc gì”, “tư vấn giúp”, hãy xem đó là nhu cầu hợp lệ và đặt vào "symptom".
4. Nếu không tìm được thông tin, hãy đặt null.
5. Tạo danh sách "missing": các trường chưa xác định.

CHỈ trả về JSON đúng cấu trúc:

{
  "surgery": "...",
  "postOpDay": 3,
  "symptom": "...",
  "missing": ["surgery", "postOpDay"]
}

Không giải thích thêm.
`;

/* ============================================================
   3. INSTRUCTION CHO BƯỚC 2: TẠO CÂU TRẢ LỜI
   ============================================================ */
const ANSWER_SYSTEM_PROMPT = `
Bạn là Trợ lý Ảo Điều Dưỡng Hậu Phẫu của bệnh viện.
Luôn dùng giọng nói nhẹ nhàng, nhân văn, dễ hiểu.

ĐƯỢC PHÉP SỬ DỤNG:
- Tài liệu nội bộ “Chăm sóc người bệnh sau phẫu thuật”
- Kiến thức chung để viết lại câu văn dễ hiểu.

KHÔNG ĐƯỢC PHÉP:
- Chẩn đoán bệnh
- Dự đoán nguyên nhân
- Đưa thông tin không chắc chắn
- Sáng tạo kiến thức vượt ngoài tài liệu

Bạn phải trả lời theo cấu trúc:

1. **Tiêu đề**  
2. **Các gạch đầu dòng ngắn gọn – dễ hiểu – không chuyên môn hóa**  
3. **Kết thúc** bằng câu:  
   "Nếu có vấn đề khẩn cấp vui lòng liên hệ hotline: 091357080.  
    Ấn chuông gọi nhân viên y tế trong phòng bệnh / Hoặc ấn nút gọi hotline (091357080)."

Nếu trong tài liệu không có phần tương ứng, hãy trả về:  
"Vui lòng gọi điều dưỡng trực kiểm tra trực tiếp để đảm bảo an toàn hoặc gọi hotline 091357080."
`;

/* ============================================================
   4. HỎI THÂN THIỆN KHI THIẾU THÔNG TIN
   ============================================================ */
function buildFriendlyMissingMessage(missingFields) {
  const messages = [];

  if (missingFields.includes("surgery"))
    messages.push("Bạn vui lòng cho mình biết bạn đã phẫu thuật gì nhé?");
  if (missingFields.includes("postOpDay"))
    messages.push("Bạn đang ở ngày thứ mấy sau phẫu thuật ạ?");
  if (missingFields.includes("symptom"))
    messages.push("Hiện tại bạn đang gặp triệu chứng gì hoặc cần hỗ trợ điều gì?");

  return messages.join(" ");
}

/* ============================================================
   5. TÍNH TOÁN SỐ LẦN HỎI
   ============================================================ */
function countAssistantMissingQuestions(history) {
  return history.filter(m => m.role === "assistant" && m.tag === "ASK_MISSING").length;
}

/* ============================================================
   6. HANDLER CHÍNH
   ============================================================ */
export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: "Missing GEMINI_API_KEY" };
  }

  const body = JSON.parse(event.body || "{}");
  const userMessage = body.message || "";
  const history = body.history || [];

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  /* ------------------------------------------------------------
     STEP 1 — PHÂN TÍCH CÂU HỎI
     ------------------------------------------------------------ */
  const parseResult = await model.generateContent({
    contents: [
      { role: "system", parts: [{ text: PARSER_SYSTEM_PROMPT }] },
      { role: "user", parts: [{ text: userMessage }] }
    ]
  });

  let parsed = {};
  try {
    const rawParse = extractGeminiText(parseResult);
let parsed = {};
try {
  parsed = JSON.parse(rawParse);
} catch {
  return {
    statusCode: 200,
    body: JSON.stringify({
      reply: "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể nói lại đơn giản hơn được không ạ?"
    })
  };
}

  } catch {
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể nói lại bằng cách đơn giản hơn không ạ?"
      })
    };
  }

  const missing = parsed.missing || [];
  const missingAttempts = countAssistantMissingQuestions(history);

  /* ------------------------------------------------------------
     Nếu THIẾU THÔNG TIN → hỏi lại (tối đa 2 lần)
     ------------------------------------------------------------ */
  if (missing.length > 0) {
    if (missingAttempts >= 2) {
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

  /* ------------------------------------------------------------
     STEP 2 — ĐỦ THÔNG TIN → GỌI AI ĐỂ TẠO CÂU TRẢ LỜI
     ------------------------------------------------------------ */

  const answer = await model.generateContent({
    contents: [
      { role: "system", parts: [{ text: ANSWER_SYSTEM_PROMPT }] },
      { role: "system", parts: [{ text: "Dữ liệu nội bộ:\n" + KNOWLEDGE_BASE }] },
      {
        role: "user",
        parts: [
          {
            text: `
Thông tin người bệnh:
- Phẫu thuật: ${parsed.surgery}
- Ngày hậu phẫu: ${parsed.postOpDay}
- Triệu chứng / nhu cầu: ${parsed.symptom}

Hãy trả lời đúng cấu trúc đã quy định.`
          }
        ]
      }
    ]
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      reply: extractGeminiText(answer)
    })
  };
};

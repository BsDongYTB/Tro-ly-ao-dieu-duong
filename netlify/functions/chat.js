// netlify/functions/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * ============================
 * 1. KIẾN THỨC (TÊN FILE: Ngoại. Chăm sóc người bệnh sau phẫu thuật.docx)
 * ============================
 * (Đã chèn nguyên văn nội dung bạn cung cấp)
 */
const KNOWLEDGE_BASE_DATA = `
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

- Khó thở, tím tái, ngất hoặc lú lẫn.

9. Liên hệ hỗ trợ:

- Nếu đang ở bệnh viện: Bấm chuông bệnh để gọi nhân viên y tế

- Điều dưỡng trực khoa: 02383xxxxxx

- Hotline: 0913570808
`;

/**
 * ============================
 * 2. SYSTEM INSTRUCTION (rõ ràng, KHÔNG chẩn đoán, KHÔNG dự đoán)
 * ============================
 */
const SYSTEM_INSTRUCTION = `
Bạn là Trợ lý Ảo Điều Dưỡng Hậu Phẫu. 
Luôn CHỈ SỬ DỤNG: (1) "KNOWLEDGE_BASE_DATA" được cung cấp phía trên; (2) kiến thức chung an toàn của mô hình để viết câu văn tự nhiên.
KHÔNG được chẩn đoán, KHÔNG dự đoán nguyên nhân bệnh, KHÔNG đưa lời khuyên vượt thẩm quyền điều dưỡng/bác sĩ.
Trước khi trả lời, BẮT BUỘC kiểm tra đủ 3 thông tin: 
  - phẫu thuật gì? 
  - ngày thứ mấy sau phẫu thuật? 
  - triệu chứng / nhu cầu hỗ trợ gì?
Nếu thiếu thông tin → hỏi tiếp (tối đa 2 lần). Nếu người dùng trả lời "không biết", lần 1 hãy gợi ý cách tìm (ví dụ xem giấy ra viện, hỏi người nhà); nếu vẫn "không biết" lần 2 → trả về: "Vui lòng gọi điều dưỡng trực kiểm tra trực tiếp để đảm bảo an toàn hoặc gọi hotline 091357080".
Khi đã có đủ 3 thông tin: trả lời theo cấu trúc:
  1) Tiêu đề: (ví dụ: "Hướng dẫn chăm sóc sau phẫu thuật ruột thừa - ngày thứ 3")
  2) Gạch đầu dòng: các hướng dẫn cụ thể, dựa trên KNOWLEDGE_BASE_DATA (không lược bỏ ý quan trọng)
  3) Kết thúc: "Nếu có vấn đề khẩn cấp vui lòng liên hệ hotline: 091357080" và "Ấn chuông gọi nhân viên y tế trong phòng bệnh / Hoặc ấn nút gọi hotline (091357080)"
Ngôn ngữ: tiếng Việt, nhẹ nhàng, nhân văn, không dùng thuật ngữ chuyên sâu.
`;

/**
 * ============================
 * 3. Helpers: trích info từ văn bản history
 * ============================
 */
function extractFieldFromText(text) {
  if (!text) return {};
  const t = text.toLowerCase();
  const res = {};

  // Surgery detection: keywords list (heuristic)
  const surgeryKeywords = [
    "ruột thừa","appendic","đại tràng","túi mật","dạ dày","cột sống",
    "thay khớp","khớp háng","khớp gối","gãy","chấn thương","sỏi","niệu quản",
    "tán sỏi","mổ","phẫu thuật","tpu" // include variations
  ];
  for (const kw of surgeryKeywords) {
    if (t.includes(kw)) { res.surgery = kw; break; }
  }

  // post-op day: "ngày 3", "ngày thứ 3", "day 3", "d3"
  const dayMatch = t.match(/ngày\s*(?:thứ\s*)?(\d{1,2})/i) || t.match(/\bday\s*(\d{1,2})\b/i) || t.match(/\bd\+?\s*(\d{1,2})\b/i);
  if (dayMatch) res.postOpDay = Number(dayMatch[1]);

  // symptom detection (heuristic)
  const symptomKeywords = ["đau","sốt","chảy máu","rỉ dịch","rỉ dịch mủ","nôn","buồn nôn","bí trung","bí","khó thở","tiêu","đi tiêu","chướng bụng","dịch","tắc","sonde","ống dẫn lưu","vết mổ"];
  for (const kw of symptomKeywords) {
    if (t.includes(kw)) { res.symptom = kw; break; }
  }

  // detect "không biết"
  if (t.includes("không biết") || t.includes("khong biet") || t.includes("không rõ") || t.includes("khong rõ") || t.includes("không nhớ") || t.includes("khong nhơ")) {
    res.unknown = true;
  }

  return res;
}

function aggregateHistoryInfo(history = []) {
  const agg = { surgery: null, postOpDay: null, symptom: null, userUnknownCount: 0, assistantMissingPrompts: 0 };
  for (const m of history) {
    const txt = (m.text || m.content || "").toString();
    if (!txt) continue;
    if (m.role === "user") {
      const f = extractFieldFromText(txt);
      if (f.surgery && !agg.surgery) agg.surgery = f.surgery;
      if (f.postOpDay && !agg.postOpDay) agg.postOpDay = f.postOpDay;
      if (f.symptom && !agg.symptom) agg.symptom = f.symptom;
      if (f.unknown) agg.userUnknownCount += 1;
    } else if (m.role === "assistant") {
      if (txt.includes("[MISSING_INFO_PROMPT]")) agg.assistantMissingPrompts += 1;
    }
  }
  return agg;
}

/**
 * Missing info prompt (combined) - includes marker to count asks
 */
function createMissingInfoQuestion(missingFields) {
  const parts = missingFields.map(f => {
    if (f === "surgery") return "Bạn vui lòng cho biết phẫu thuật là gì (ví dụ: ruột thừa, thay khớp...)?";
    if (f === "postOpDay") return "Bạn đang ở ngày thứ mấy sau phẫu thuật (ví dụ: ngày 1, 2, 3)?";
    if (f === "symptom") return "Bạn đang gặp triệu chứng gì hoặc cần hỗ trợ gì (ví dụ: đau, sốt, chảy dịch, khó tiêu)?";
    return "";
  });
  return `[MISSING_INFO_PROMPT] ${parts.join(" ")} (Trả lời ngắn: phẫu thuật / ngày thứ mấy / triệu chứng)`;
}

/**
 * Gemini call with retry to avoid short 429 bursts
 */
async function callGeminiWithRetry(model, payload, retries = 2) {
  try {
    return await model.generateContent(payload);
  } catch (err) {
    const msg = (err?.message || "").toLowerCase();
    if (msg.includes("429") && retries > 0) {
      await new Promise(r => setTimeout(r, 1200));
      return callGeminiWithRetry(model, payload, retries - 1);
    }
    throw err;
  }
}

/**
 * Build contents array for Gemini call (system + knowledge + short history + user summary)
 */
function buildContents(questionSummary, history) {
  const contents = [];

  // System instruction
  contents.push({
    role: "system",
    parts: [{ text: SYSTEM_INSTRUCTION }]
  });

  // Knowledge base (as a user/system part the model will use as reference)
  contents.push({
    role: "system",
    parts: [{ text: `TÀI LIỆU THAM KHẢO (KHÔNG ĐƯỢC THAY THẾ):\n${KNOWLEDGE_BASE_DATA}` }]
  });

  // Short recent history to keep context (limit to last 6)
  const short = history.slice(-6);
  for (const h of short) {
    const role = h.role === "user" ? "user" : (h.role === "assistant" ? "assistant" : "user");
    contents.push({ role, parts: [{ text: h.text || h.content || "" }] });
  }

  // Finally the instruction for generating the assistant reply
  contents.push({
    role: "user",
    parts: [{ text: questionSummary }]
  });

  return contents;
}

/**
 * ============================
 * MAIN HANDLER
 * ============================
 */
export const handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  // Ensure API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY not set." }) };
  }

  // Parse body
  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body." }) };
  }

  // Accept: history (array), message (string)
  const history = Array.isArray(body.history) ? body.history : [];
  const incoming = (body.message || "").trim();
  const conversation = [...history];
  if (incoming) conversation.push({ role: "user", text: incoming });

  // Aggregate info
  const agg = aggregateHistoryInfo(conversation);
  const missing = [];
  if (!agg.surgery) missing.push("surgery");
  if (!agg.postOpDay) missing.push("postOpDay");
  if (!agg.symptom) missing.push("symptom");

  // Count assistant prompts and user unknowns
  const assistantAsked = agg.assistantMissingPrompts || 0;
  const userUnknownCount = agg.userUnknownCount || 0;

  // If missing fields exist -> ask (max 2 times), or fallback when exceeded
  if (missing.length > 0) {
    if (assistantAsked >= 2 || userUnknownCount >= 2) {
      const fallback = "Vui lòng gọi điều dưỡng trực kiểm tra trực tiếp để đảm bảo an toàn hoặc gọi hotline 091357080";
      return { statusCode: 200, body: JSON.stringify({ reply: fallback }) };
    }
    const prompt = createMissingInfoQuestion(missing);
    return { statusCode: 200, body: JSON.stringify({ reply: prompt }) };
  }

  // At this point we have surgery, postOpDay, symptom => prepare summary and call Gemini
  const questionSummary = `Bối cảnh: phẫu thuật: ${agg.surgery}; ngày hậu phẫu: ngày thứ ${agg.postOpDay}; triệu chứng / nhu cầu: ${agg.symptom}.
YÊU CẦU: Viết một phản hồi trợ giúp người bệnh theo TÀI LIỆU đã cung cấp. Trả lời theo cấu trúc:
1) Tiêu đề: ví dụ "Hướng dẫn chăm sóc sau phẫu thuật [phẫu thuật] - ngày thứ [n]"
2) Gạch đầu dòng: các hướng dẫn cụ thể, ngắn gọn, dễ hiểu, không dùng thuật ngữ chuyên sâu, KHÔNG chẩn đoán, KHÔNG dự đoán. Nếu thông tin cần thiết đã có trong tài liệu, hãy sử dụng y nguyên nội dung chuyên môn nhưng chuyển ngôn ngữ sang dễ hiểu. Không được lược bỏ các hướng dẫn quan trọng.
3) Kết thúc: "Nếu có vấn đề khẩn cấp vui lòng liên hệ hotline: 091357080" và "Ấn chuông gọi nhân viên y tế trong phòng bệnh / Hoặc ấn nút gọi hotline (091357080)".

Lưu ý model: CHỈ SỬ DỤNG KNOWLEDGE_BASE_DATA + kiến thức chung để làm câu văn tự nhiên. Nghiêm cấm chẩn đoán hoặc dự đoán nguyên nhân. Nếu không có chỉ dẫn rõ ràng trong tài liệu cho tình huống này, hãy trả về câu an toàn: "Vui lòng gọi điều dưỡng trực kiểm tra trực tiếp để đảm bảo an toàn hoặc gọi hotline 091357080".`;

  // Build contents
  const contents = buildContents(questionSummary, conversation);

  // Init Gemini client & model
  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const response = await callGeminiWithRetry(model, { contents });

    // Extract text robustly
    let text = null;
    if (response?.response?.text) {
      // some SDKs provide response.response.text() as function
      try {
        const maybeFn = response.response.text;
        text = (typeof maybeFn === "function") ? maybeFn() : maybeFn;
      } catch (e) {
        text = response.response.text;
      }
    } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      text = null;
    }

    if (!text) {
      return { statusCode: 200, body: JSON.stringify({ reply: "Không thể tạo phản hồi lúc này. Vui lòng thử lại hoặc gọi hotline 091357080." }) };
    }

    // Safety post-check: if for some reason model attempted chẩn đoán phrases, neutralize.
    const lower = text.toLowerCase();
    const diagnosisHints = ["chẩn đoán", "có thể là", "nghi ngờ", "có khả năng", "có thể do"];
    for (const hint of diagnosisHints) {
      if (lower.includes(hint)) {
        // Replace risky sentence with safe fallback instruction
        const safeMsg = "Theo quy định, trợ lý không thực hiện chẩn đoán. Vui lòng gọi điều dưỡng trực để kiểm tra.";
        text = text.replace(new RegExp(hint, "ig"), "").trim() + "\n\n" + safeMsg;
        break;
      }
    }

    // Ensure ending contains hotline & bell line
    const hotlineLine = "\n\nNếu có vấn đề khẩn cấp vui lòng liên hệ hotline: 091357080\nẤn chuông gọi nhân viên y tế trong phòng bệnh / Hoặc ấn nút gọi hotline (091357080)";
    if (!text.includes("091357080")) {
      text = text.trim() + hotlineLine;
    }

    return { statusCode: 200, body: JSON.stringify({ reply: text }) };

  } catch (err) {
    console.error("Gemini API Error:", err);
    const msg = (err?.message || "").toLowerCase();
    if (msg.includes("429")) {
      return { statusCode: 500, body: JSON.stringify({ error: "Lỗi 429: Hạn mức API tạm thời bị quá tải. Vui lòng thử lại sau." }) };
    } else if (msg.includes("api key") || msg.includes("invalid")) {
      return { statusCode: 500, body: JSON.stringify({ error: "Lỗi xác thực: GEMINI_API_KEY không hợp lệ." }) };
    } else {
      return { statusCode: 500, body: JSON.stringify({ error: "Lỗi khi gọi AI: " + (err?.message || String(err)) }) };
    }
  }
};

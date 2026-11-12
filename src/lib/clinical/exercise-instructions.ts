import {
  MUSCLE_EVIDENCE_SOURCES as S,
  type MuscleEvidenceSource,
} from "./evidence-muscle";
import type {
  ExerciseInstruction,
  InstructionText,
} from "./exercise-instruction-types";

/**
 * Instruction cards for six existing Atlas exercise IDs (content version 1).
 *
 * - `sourced` lines reuse source records and reading scopes already held in
 *   `evidence-muscle.ts`, with their original checked dates. No new source was
 *   read for this catalog; see docs/research/2026-11-12-exercise-instruction-scope.md.
 * - `coaching-example` lines are app-authored teaching wording, not evidence.
 * - Source comparison is not clinical validation; `reviewedBy` stays null.
 */
const sourced = (
  text: string,
  ...sources: MuscleEvidenceSource[]
): InstructionText => ({ kind: "sourced", text, sources });
const example = (text: string): InstructionText => ({
  kind: "coaching-example",
  text,
});

const COMMON_LIMITS = [
  "Các bước, câu hướng dẫn và điểm quan sát là ví dụ thực hành để PT điều chỉnh, không phải giao thức đã được xác nhận cho từng người.",
  "Thẻ không dùng tỷ lệ kích hoạt cơ hay mô hình 3D làm bằng chứng cho lời hướng dẫn, và không nhằm chẩn đoán hay đánh giá nguy cơ chấn thương.",
  "Đau dai dẳng hoặc triệu chứng bất thường cần đánh giá riêng; thẻ này không thay thế việc đó.",
];

export const EXERCISE_INSTRUCTIONS: readonly ExerciseInstruction[] = [
  {
    exerciseId: "incline-db-press",
    version: 1,
    variantNote:
      "Đẩy tạ đơn trên ghế dốc nhẹ; 30° chỉ là một ví dụ về độ dốc, không phải góc tối ưu.",
    setup: [
      example(
        "Chỉnh ghế ở độ dốc nhẹ người tập thấy ổn định, bàn chân đặt vững trên sàn, lưng và đầu tựa vào ghế.",
      ),
      example(
        "Chọn tạ mà người tập đưa vào vị trí bắt đầu được mà không phải giật hay nhờ người khác.",
      ),
    ],
    execution: [
      example("Đưa hai tạ lên vị trí bắt đầu phía trên ngực, cánh tay duỗi vừa phải."),
      example("Hạ tạ chậm, khuỷu đi xuống và hơi ra ngoài thân, dừng ở độ sâu vai thoải mái."),
      example("Đẩy tạ lên theo đường ổn định cho đến khi gần duỗi khuỷu."),
      example("Hạ tạ về vị trí đặt có kiểm soát sau hiệp, không thả rơi."),
    ],
    cues: [
      example("“Hạ chậm, dừng ở chỗ vai bạn còn thoải mái.”"),
      example("“Giữ chân chắc, đẩy tạ lên theo một đường đều.”"),
    ],
    observations: [
      sourced(
        "Cơ ngực lớn và delta trước tham gia vận động vai trong động tác đẩy; cơ tam đầu duỗi khuỷu. Đây là mô tả chức năng theo hành động, không phải xếp hạng đóng góp từng cơ.",
        S.upper,
      ),
      example("Quan sát hai tạ có đi đều nhau và người tập còn kiểm soát được nhịp hạ."),
    ],
    adjustments: [
      {
        context: "Khi vai chưa thoải mái ở độ sâu đang dùng",
        suggestion: example("Giảm độ sâu hoặc giảm tải; PT quyết định mức áp dụng."),
        alternativeExerciseId: null,
      },
    ],
    limitations: [
      "Nghiên cứu về đẩy ngang và dốc được đối chiếu dùng máy Smith 0° hoặc 44° ở người trẻ chưa tập, không phải tạ đơn 30°; không rút ra góc ghế tối ưu.",
      ...COMMON_LIMITS,
    ],
    reviewedBy: null,
    media: null,
  },
  {
    exerciseId: "cable-chest-fly",
    version: 1,
    variantNote:
      "Ép ngực bằng hai ròng rọc ở tư thế ngồi; không bao gồm biến thể đứng hoặc nằm.",
    setup: [
      example("Chỉnh độ cao hai ròng rọc và ghế để tay cầm ngang tầm ngực thoải mái."),
      example("Ngồi tựa lưng, bàn chân vững, khuỷu hơi gập và giữ nguyên góc đó trong cả hiệp."),
    ],
    execution: [
      example("Bắt đầu với hai tay mở ra bên ở biên độ vai dung nạp."),
      example("Khép hai tay về trước ngực theo đường cung, giữ góc khuỷu."),
      example("Dừng ngắn trước ngực nếu giúp kiểm soát; không cần bắt chéo tay."),
      example("Trả tay ra có kiểm soát đến biên độ ban đầu, không để cáp kéo giật."),
    ],
    cues: [
      example("“Giữ khuỷu hơi gập, khép tay như đang ôm.”"),
      example("“Trả tay chậm, dừng khi vai bắt đầu khó chịu.”"),
    ],
    observations: [
      sourced(
        "Cơ ngực lớn tham gia khép cánh tay; cơ delta trước có thể phối hợp tùy đường tay. Đây là suy luận theo chức năng, không phải số đo hoạt động.",
        S.pectoral,
        S.upper,
      ),
      example("Quan sát khuỷu có đổi góc trong hiệp và tải có làm người tập giật thân hay không."),
    ],
    adjustments: [
      {
        context: "Khi cơ sở không có hai ròng rọc",
        suggestion: example("PT cân nhắc một bài đẩy ngực khác đã có trong Atlas; không tự thay bài trong giáo án."),
        alternativeExerciseId: "incline-db-press",
      },
    ],
    limitations: [
      "Chưa có thử nghiệm cable fly ngồi cụ thể được đối chiếu; không xác nhận lực căng không đổi hay ưu thế khi tay cắt chéo.",
      ...COMMON_LIMITS,
    ],
    reviewedBy: null,
    media: null,
  },
  {
    exerciseId: "cable-lateral-raise",
    version: 1,
    variantNote:
      "Nâng vai ngang bằng một ròng rọc điều chỉnh; vị trí cáp và tay cầm tùy máy.",
    setup: [
      example("Chỉnh ròng rọc ở độ cao người tập thấy dễ kiểm soát và đứng sao cho cáp không cọ vào người."),
      example("Đứng vững hai chân, thân thẳng thoải mái, tay cầm bên đối diện hoặc cùng bên theo thiết lập."),
    ],
    execution: [
      example("Bắt đầu với tay cạnh thân, khuỷu hơi gập."),
      example("Nâng tay ra bên theo đường thoải mái, để bả vai vận động cùng tay."),
      example("Dừng khi tay đạt độ cao kiểm soát được, không cần vượt quá mức vai dung nạp."),
      example("Hạ tay chậm về vị trí bắt đầu, không để cáp kéo tay về."),
    ],
    cues: [
      example("“Nâng ra bên, để bả vai đi cùng.”"),
      example("“Hạ chậm, đừng để tạ kéo tay về.”"),
    ],
    observations: [
      sourced(
        "Cơ delta góp phần dạng vai; cơ thang phối hợp vận động bả vai.",
        S.deltoid,
        S.upper,
      ),
      example("Quan sát thân có nghiêng hoặc giật để lấy đà hay không."),
    ],
    adjustments: [
      {
        context: "Khi dùng cáp hoặc tạ đơn với biên độ đã chuẩn hóa",
        suggestion: sourced(
          "Một thử nghiệm 8 tuần ở 24 người đã tập, so sánh cáp và tạ đơn trong biên độ chuẩn hóa, ghi nhận mức tăng độ dày delta giữa tương tự. Chọn dụng cụ theo thiết bị sẵn có; PT quyết định.",
          S.lateralRaise,
        ),
        alternativeExerciseId: null,
      },
    ],
    limitations: [
      "Nghiên cứu không khảo sát mọi vị trí cáp hoặc độ cao tay cầm; không xác nhận cấu hình cáp sau lưng là tối ưu.",
      "Mô-men tại mỗi góc phụ thuộc đường cáp và cơ thể người tập.",
      ...COMMON_LIMITS,
    ],
    reviewedBy: null,
    media: null,
  },
  {
    exerciseId: "chest-supported-tbar-row",
    version: 1,
    variantNote:
      "Chèo có tựa ngực trên T-bar hoặc máy row có đệm ngực; tay cầm và góc đệm tùy máy.",
    setup: [
      example("Chỉnh đệm ngực để người tập thở thoải mái và tay với tới tay cầm khi duỗi."),
      example("Chọn loại tay cầm phù hợp; bàn chân đặt vững trên bệ hoặc sàn."),
    ],
    execution: [
      example("Duỗi tay và để bả vai hơi mở về phía trước ở vị trí bắt đầu."),
      example("Kéo khuỷu về phía sau, kéo bả vai lại gần cột sống."),
      example("Dừng ngắn ở vị trí kéo nếu giúp kiểm soát, ngực vẫn tựa vào đệm."),
      example("Trả tay chậm về vị trí bắt đầu, không thả tạ."),
    ],
    cues: [
      example("“Kéo khuỷu ra sau, giữ ngực tựa vào đệm.”"),
      example("“Trả tải chậm, để bả vai mở ra theo.”"),
    ],
    observations: [
      sourced(
        "Cơ thang và cơ trám vận động bả vai; cơ delta sau và cơ lưng rộng đưa cánh tay ra sau; các cơ gập khuỷu phối hợp. Đây là mô tả chức năng theo động tác.",
        S.muscles,
        S.upper,
      ),
      example("Quan sát ngực có bật khỏi đệm hoặc người tập có giật tải để kéo hay không."),
    ],
    adjustments: [
      {
        context: "Khi không có máy hoặc đệm tựa ngực",
        suggestion: example("PT cân nhắc một bài kéo khác trong Atlas; không tự thay bài trong giáo án."),
        alternativeExerciseId: "neutral-lat-pulldown",
      },
    ],
    limitations: [
      "Nghiên cứu điện cơ được đối chiếu chỉ khảo sát seated row, không phải chest-supported T-bar row.",
      "Không xác nhận góc khuỷu tối ưu; tựa ngực không phải điều trị đau cổ hoặc lưng.",
      ...COMMON_LIMITS,
    ],
    reviewedBy: null,
    media: null,
  },
  {
    exerciseId: "glute-bulgarian-split-squat",
    version: 1,
    variantNote:
      "Split squat kê chân sau trên bục thấp kèm dumbbell; bục và bước tùy người tập.",
    setup: [
      example("Chọn bục thấp vững; đặt chân sau lên bục và chân trước ở khoảng cách người tập giữ được thăng bằng."),
      example("Có thể vịn hỗ trợ; bắt đầu không tải hoặc tải nhẹ để làm quen."),
    ],
    execution: [
      example("Đứng thẳng, trọng lượng dồn chủ yếu lên chân trước."),
      example("Hạ thân bằng cách gập háng và gối trước, thân nghiêng theo khả năng thăng bằng."),
      example("Hạ đến độ sâu kiểm soát được, gót chân trước vẫn tiếp đất."),
      example("Đẩy sàn bằng chân trước để đứng lên, giữ chậu ổn định."),
    ],
    cues: [
      example("“Hạ xuống chậm, giữ gót chân trước chạm sàn.”"),
      example("“Đẩy sàn lên, giữ chậu thẳng.”"),
    ],
    observations: [
      sourced(
        "Cơ mông lớn và một phần cơ khép duỗi háng; nhóm cơ tứ đầu duỗi gối. Giữ chậu khi chống một chân là diễn giải cơ học, không phải số đo.",
        S.hip,
        S.thigh,
      ),
      example("Quan sát người tập có giữ được thăng bằng và chậu không xoay mạnh khi hạ."),
    ],
    adjustments: [
      {
        context: "Khi chưa giữ được thăng bằng với bục hiện tại",
        suggestion: example("Giảm độ cao bục, rút ngắn bước hoặc dùng điểm vịn; PT quyết định."),
        alternativeExerciseId: null,
      },
    ],
    limitations: [
      "Chưa đối chiếu thử nghiệm phì đại trực tiếp ở biến thể này.",
      "Không khẳng định góc thân, độ dài bước hoặc độ cao bục sẽ ưu tiên một cơ cụ thể.",
      ...COMMON_LIMITS,
    ],
    reviewedBy: null,
    media: null,
  },
  {
    exerciseId: "barbell-hip-thrust",
    version: 1,
    variantNote:
      "Hip thrust tạ đòn (hoặc máy) với lưng trên ghế; máy có thể khác giao thức đã đối chiếu.",
    setup: [
      example("Đặt lưng trên tựa chắc ở dưới xương bả vai, ghế không xê dịch."),
      example("Đệm tạ đòn và đặt trên chậu; chỉnh bàn chân thoải mái, đầu gối gập ở góc người tập kiểm soát được."),
    ],
    execution: [
      example("Từ vị trí hông thấp, siết bụng nhẹ và giữ thân ổn định."),
      example("Nâng hông cho đến khi thân và đùi gần cùng một đường."),
      example("Dừng ngắn ở đỉnh nếu giúp kiểm soát; không ưỡn lưng dưới để nâng thêm."),
      example("Hạ hông chậm về vị trí bắt đầu."),
    ],
    cues: [
      example("“Nâng hông lên, giữ xương sườn hạ thấp.”"),
      example("“Giữ thân thẳng, không ưỡn thêm ở lưng dưới.”"),
    ],
    observations: [
      sourced(
        "Cơ mông lớn và gân kheo hai khớp góp phần duỗi háng; giữ góc gối là diễn giải tùy tư thế.",
        S.hip,
        S.thigh,
      ),
      sourced(
        "Một thử nghiệm 9 tuần ở 34 người chưa tập, thể tích set được cân bằng, ghi nhận tăng kích thước mông lớn tương tự giữa hip thrust và squat; mông nhỡ–bé thay đổi ít.",
        S.plotkin,
      ),
      example("Quan sát lưng dưới có ưỡn quá mức ở đỉnh hay không."),
    ],
    adjustments: [
      {
        context: "Khi không có ghế vững hoặc tạ đòn có đệm",
        suggestion: example("PT cân nhắc một bài chân và mông khác trong Atlas; không tự thay bài trong giáo án."),
        alternativeExerciseId: "glute-bulgarian-split-squat",
      },
    ],
    limitations: [
      "Nghiên cứu không chứng minh hip thrust tối ưu cho mọi bó mông, hay giữ 2 giây là bắt buộc.",
      "Biến thể máy có thể khác giao thức đã đối chiếu.",
      ...COMMON_LIMITS,
    ],
    reviewedBy: null,
    media: null,
  },
];

export const EXERCISE_INSTRUCTION_IDS: readonly string[] =
  EXERCISE_INSTRUCTIONS.map((card) => card.exerciseId);

const BY_ID = new Map(EXERCISE_INSTRUCTIONS.map((card) => [card.exerciseId, card]));

/** Exact-ID lookup. No fuzzy match and no fallback to another exercise or muscle group. */
export function getExerciseInstruction(
  exerciseId: string | null | undefined,
): ExerciseInstruction | null {
  if (typeof exerciseId !== "string") return null;
  return BY_ID.get(exerciseId) ?? null;
}

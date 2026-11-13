import type { EvidenceSource } from "@/lib/clinical/evidence-types";
import type { PtCase } from "./case-types";

const screening: EvidenceSource = {
  title: "CSEP · Get Active Questionnaire",
  url: "https://csep.ca/2021/01/20/pre-screening-for-physical-activity/",
  checkedAt: "2026-11-13",
  access:
    "Trang giới thiệu, mục Using the Get Active Questionnaire và Practitioners. Phạm vi: vai trò của sàng lọc trước tập.",
};
const upperLimb: EvidenceSource = {
  title: "OpenStax · Anatomy and Physiology 2e, mục 11.5",
  url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs",
  checkedAt: "2026-11-13",
  access:
    "Phần Muscles That Move the Humerus và Muscles That Move the Forearm. Phạm vi: động tác của cơ, gồm vai trò duỗi khuỷu của cơ tam đầu.",
};

function workflow(id: string, description: string): PtCase["criteria"][number] {
  return { id, description, sources: [], basis: "authored-workflow" };
}

export const PT_CASES: readonly PtCase[] = [
  {
    id: "intake-missing-information",
    version: 1,
    title: "Hồ sơ còn thiếu thông tin",
    objective: "Hỏi thêm và ghi nhận thông tin trước khi chọn hướng tập.",
    domain: "screening-evaluation",
    fictionalContext:
      "Một học viên mới muốn bắt đầu tập sức mạnh. Hồ sơ có mục tiêu nhưng phần sàng lọc trước tập chưa được điền.",
    entryCheckpointId: "ask",
    criteria: [
      {
        id: "screen",
        description:
          "Làm rõ mục sàng lọc còn thiếu trước khi lên lịch đánh giá thể lực.",
        sources: [screening],
        basis: "sourced",
      },
      workflow(
        "record",
        "Ghi đúng nội dung học viên xác nhận và để mục chưa rõ ở trạng thái chưa xác nhận.",
      ),
      workflow(
        "agree",
        "Thống nhất bước tiếp theo để hoàn tất thông tin còn thiếu.",
      ),
    ],
    checkpoints: [
      {
        id: "ask",
        prompt: "Bạn bắt đầu cuộc trao đổi như thế nào?",
        criterionIds: ["screen"],
        choices: [
          {
            id: "review-together",
            label: "Mời học viên cùng xem và hoàn tất phần sàng lọc.",
            feedback:
              "Bạn xác định được mục cần hỏi thêm trước khi lên lịch đánh giá.",
            criterionIds: ["screen"],
            nextCheckpointId: "document",
          },
          {
            id: "screen-first",
            label: "Đặt một buổi trao đổi ngắn để làm rõ các câu còn bỏ trống.",
            feedback:
              "Bạn dành thời gian để học viên xác nhận thông tin còn thiếu.",
            criterionIds: ["screen"],
            nextCheckpointId: "document",
          },
          {
            id: "assume-no",
            label:
              "Coi các mục để trống là câu trả lời không và chuyển thẳng sang soạn buổi.",
            feedback:
              "Bạn đã suy diễn câu trả lời từ ô trống. Hãy hỏi học viên để hoàn tất sàng lọc.",
            criterionIds: [],
            nextCheckpointId: null,
          },
        ],
      },
      {
        id: "document",
        prompt: "Học viên chưa chắc về một câu. Bạn ghi thế nào?",
        criterionIds: ["record"],
        choices: [
          {
            id: "mark-unknown",
            label:
              "Giữ mục đó ở trạng thái chưa xác nhận và ghi câu cần hỏi lại.",
            feedback:
              "Hồ sơ thể hiện đúng phần đã biết và phần còn cần xác minh.",
            criterionIds: ["record"],
            nextCheckpointId: "follow-up",
          },
          {
            id: "fill-by-guess",
            label: "Điền câu trả lời theo suy đoán để hoàn tất biểu mẫu.",
            feedback: "Mục đó vẫn cần được học viên xác nhận.",
            criterionIds: [],
            nextCheckpointId: "follow-up",
          },
        ],
      },
      {
        id: "follow-up",
        prompt: "Bạn kết thúc cuộc trao đổi bằng bước nào?",
        criterionIds: ["agree"],
        choices: [
          {
            id: "agree-next",
            label:
              "Thống nhất thông tin cần bổ sung và thời điểm trao đổi lại.",
            feedback: "Cả hai biết cần làm gì trước khi chốt buổi đánh giá.",
            criterionIds: ["agree"],
            nextCheckpointId: null,
          },
          {
            id: "skip-follow-up",
            label: "Kết thúc cuộc trao đổi mà chưa hẹn cách bổ sung thông tin.",
            feedback:
              "Hãy chốt một bước cụ thể để mục còn thiếu được giải quyết.",
            criterionIds: [],
            nextCheckpointId: null,
          },
        ],
      },
    ],
    limitations: [
      "Tình huống minh họa cách xử lý thông tin thiếu. Quyết định cá nhân cần thông tin sàng lọc đầy đủ và người có chuyên môn phù hợp.",
    ],
    reviewedBy: null,
  },
  {
    id: "equipment-change",
    version: 1,
    title: "Thiết bị trong giáo án đang bận",
    objective:
      "Trao đổi phương án đổi thứ tự hoặc đổi biến thể và ghi lại lựa chọn.",
    domain: "exercise-programming",
    fictionalContext:
      "Buổi tập có bài ép ngực bằng cáp. Trạm cáp đang bận, nhưng còn ghế và tạ đơn. Buổi tập có thời lượng cố định.",
    entryCheckpointId: "options",
    reading: {
      href: "/atlas?tab=hypertrophy&exercise=cable-chest-fly",
      label: "Thẻ ép ngực bằng cáp trong Atlas",
    },
    criteria: [
      workflow(
        "compare",
        "Xem mục tiêu của bài và thiết bị có sẵn trước khi quyết định đổi.",
      ),
      workflow(
        "agree",
        "Trao đổi phương án cụ thể với học viên và hỏi mức quen thuộc với lựa chọn.",
      ),
      workflow("document", "Ghi rõ bài và thông số thực tế của buổi."),
    ],
    checkpoints: [
      {
        id: "options",
        prompt: "Bạn xem xét phương án nào trước?",
        criterionIds: ["compare"],
        choices: [
          {
            id: "check-order",
            label:
              "Kiểm tra có thể đổi thứ tự để giữ bài cáp trong buổi không.",
            feedback:
              "Đổi thứ tự có thể giữ bài trong giáo án nếu thời gian và thiết bị cho phép.",
            criterionIds: ["compare"],
            nextCheckpointId: "discuss",
          },
          {
            id: "check-variant",
            label:
              "Xem mục tiêu của bài và cân nhắc một biến thể với thiết bị sẵn có.",
            feedback:
              "Bạn dùng mục tiêu của bài để cân nhắc thay đổi thiết bị.",
            criterionIds: ["compare"],
            nextCheckpointId: "discuss",
          },
          {
            id: "copy-load",
            label: "Đổi sang tạ đơn và giữ nguyên số kg ghi cho máy cáp.",
            feedback:
              "Giáo án đang mô tả một thiết lập khác. Cần xem lại biến thể và thông số trước khi chốt.",
            criterionIds: [],
            nextCheckpointId: null,
          },
        ],
      },
      {
        id: "discuss",
        prompt: "Trạm cáp sẽ bận đến hết buổi. Bạn trao đổi thế nào?",
        criterionIds: ["agree"],
        choices: [
          {
            id: "confirm-change",
            label:
              "Giải thích lựa chọn thay thế và hỏi học viên đã quen với biến thể đó chưa.",
            feedback:
              "Học viên biết điều gì thay đổi và có cơ hội nói rõ kinh nghiệm của mình.",
            criterionIds: ["agree"],
            nextCheckpointId: "log",
          },
          {
            id: "change-silently",
            label: "Đổi bài ngay và giữ nguyên phần hướng dẫn cũ.",
            feedback:
              "Hãy báo rõ tên bài và thiết lập mới để hai bên hiểu cùng một phương án.",
            criterionIds: [],
            nextCheckpointId: "log",
          },
        ],
      },
      {
        id: "log",
        prompt: "Sau buổi tập, bạn ghi gì?",
        criterionIds: ["document"],
        choices: [
          {
            id: "log-actual",
            label: "Ghi biến thể và kết quả từng hiệp thực tế, kèm lý do đổi.",
            feedback:
              "Lần xem lại có thể phân biệt bài dự kiến với bài đã thực hiện.",
            criterionIds: ["document"],
            nextCheckpointId: null,
          },
          {
            id: "log-as-planned",
            label: "Ghi tên bài cáp như trong giáo án dù đã dùng tạ đơn.",
            feedback: "Tên bài trong lịch sử cần phản ánh biến thể thực tế.",
            criterionIds: [],
            nextCheckpointId: null,
          },
        ],
      },
    ],
    limitations: [
      "Các phương án là ví dụ tổ chức buổi tập. Việc đổi bài cần xét mục tiêu và cách thực hiện cụ thể.",
    ],
    reviewedBy: null,
  },
  {
    id: "explain-an-exercise",
    version: 1,
    title: "Giải thích một bài đẩy ngực",
    objective:
      "Nói mục đích, chọn một lời hướng dẫn và kiểm tra học viên đã hiểu.",
    domain: "training-instruction",
    fictionalContext:
      "Học viên lần đầu xem bài đẩy ngực với tạ đơn trên ghế dốc. Họ hỏi vì sao khuỷu tay duỗi khi đẩy tạ lên.",
    entryCheckpointId: "explain",
    reading: {
      href: "/atlas?tab=hypertrophy&exercise=incline-db-press",
      label: "Thẻ đẩy ngực ghế dốc trong Atlas",
    },
    criteria: [
      {
        id: "purpose",
        description:
          "Mô tả phần duỗi khuỷu bằng lời dễ hiểu. Cơ tam đầu cánh tay tham gia duỗi khuỷu.",
        sources: [upperLimb],
        basis: "sourced",
      },
      workflow(
        "cue",
        "Đưa một lời hướng dẫn ngắn, gắn với phần động tác cần quan sát.",
      ),
      workflow(
        "check",
        "Mời học viên nhắc lại hoặc làm mẫu để kiểm tra sự hiểu.",
      ),
    ],
    checkpoints: [
      {
        id: "explain",
        prompt: "Bạn trả lời câu hỏi về khuỷu tay thế nào?",
        criterionIds: ["purpose"],
        choices: [
          {
            id: "plain-explain",
            label:
              "Giải thích rằng khi đẩy lên, khuỷu duỗi ra với sự tham gia của cơ tam đầu.",
            feedback: "Bạn nối câu hỏi của học viên với chức năng duỗi khuỷu.",
            criterionIds: ["purpose"],
            nextCheckpointId: "cue",
          },
          {
            id: "show-elbow",
            label:
              "Chỉ vào khuỷu khi làm mẫu và nói cơ tam đầu góp phần làm thẳng khuỷu.",
            feedback:
              "Minh họa giúp gắn lời giải thích với chuyển động đang thấy.",
            criterionIds: ["purpose"],
            nextCheckpointId: "cue",
          },
          {
            id: "skip-explain",
            label: "Bảo học viên làm theo mẫu và bỏ qua câu hỏi.",
            feedback: "Học viên vẫn chưa được giải đáp về chuyển động ở khuỷu.",
            criterionIds: [],
            nextCheckpointId: null,
          },
        ],
      },
      {
        id: "cue",
        prompt: "Học viên hỏi cần chú ý gì khi hạ tạ. Bạn chọn lời nhắc nào?",
        criterionIds: ["cue"],
        choices: [
          {
            id: "short-cue",
            label: "Nói một câu ngắn: “Hạ tạ chậm và đều.”",
            feedback: "Lời nhắc tập trung vào nhịp hạ mà PT có thể quan sát.",
            criterionIds: ["cue"],
            nextCheckpointId: "verify",
          },
          {
            id: "many-cues",
            label:
              "Đọc toàn bộ danh sách hướng dẫn trong khi học viên đang thử động tác.",
            feedback:
              "Hãy ưu tiên một lời nhắc liên quan trực tiếp đến phần đang quan sát.",
            criterionIds: [],
            nextCheckpointId: "verify",
          },
        ],
      },
      {
        id: "verify",
        prompt: "Bạn kiểm tra sự hiểu bằng cách nào?",
        criterionIds: ["check"],
        choices: [
          {
            id: "ask-show",
            label:
              "Mời học viên nhắc lại lời hướng dẫn hoặc làm mẫu theo cách họ hiểu.",
            feedback:
              "Bạn có cơ hội thấy phần đã hiểu và phần cần giải thích thêm.",
            criterionIds: ["check"],
            nextCheckpointId: null,
          },
          {
            id: "assume-understood",
            label: "Thấy học viên gật đầu thì chuyển ngay sang bài tiếp theo.",
            feedback:
              "Gật đầu chưa cho thấy học viên sẽ thực hiện lời hướng dẫn ra sao.",
            criterionIds: [],
            nextCheckpointId: null,
          },
        ],
      },
    ],
    limitations: [
      "Lời nhắc là ví dụ thực hành. Nguồn giải phẫu mô tả chức năng của cơ trong động tác duỗi khuỷu.",
    ],
    reviewedBy: null,
  },
  {
    id: "review-an-unrecorded-session",
    version: 1,
    title: "Buổi theo lịch chưa có kết quả",
    objective: "Xác minh buổi thực tế và lưu đúng những hiệp đã được xác nhận.",
    domain: "professionalism-risk",
    fictionalContext:
      "Giáo án có buổi tập thứ Hai. Đến thứ Tư, hồ sơ chưa có kết quả. Học viên nhắn rằng họ có tập nhưng chưa nhớ đủ từng hiệp.",
    entryCheckpointId: "verify-session",
    criteria: [
      workflow(
        "verify",
        "Phân biệt lịch dự kiến với buổi thực tế và hỏi lại ngày thực hiện.",
      ),
      workflow(
        "actual",
        "Chỉ ghi số lần và tải đã được xác nhận cho từng hiệp.",
      ),
      workflow(
        "status",
        "Lưu tiến độ khi còn thiếu kết quả và thống nhất cách bổ sung.",
      ),
    ],
    checkpoints: [
      {
        id: "verify-session",
        prompt: "Bạn xác minh gì trước khi ghi buổi tập?",
        criterionIds: ["verify"],
        choices: [
          {
            id: "confirm-date",
            label: "Hỏi học viên đã tập buổi nào và vào ngày nào.",
            feedback:
              "Bạn xác minh được buổi thực tế trước khi chọn mục trong giáo án.",
            criterionIds: ["verify"],
            nextCheckpointId: "record-sets",
          },
          {
            id: "check-note",
            label:
              "Mời học viên xem lại ghi chú tập, rồi xác nhận ngày và buổi đã thực hiện.",
            feedback:
              "Ghi chú giúp hai bên xác minh cùng một buổi trước khi nhập.",
            criterionIds: ["verify"],
            nextCheckpointId: "record-sets",
          },
          {
            id: "mark-scheduled",
            label: "Đánh dấu buổi thứ Hai đã hoàn thành dựa vào lịch.",
            feedback:
              "Lịch chỉ cho biết buổi dự kiến. Hãy hỏi lại ngày và kết quả thực tế.",
            criterionIds: [],
            nextCheckpointId: null,
          },
        ],
      },
      {
        id: "record-sets",
        prompt: "Học viên chỉ nhớ kết quả hiệp đầu. Bạn nhập thế nào?",
        criterionIds: ["actual"],
        choices: [
          {
            id: "record-known",
            label: "Nhập hiệp đã xác nhận và để trống phần chưa nhớ.",
            feedback:
              "Lịch sử giữ được kết quả đã biết và cho thấy phần cần bổ sung.",
            criterionIds: ["actual"],
            nextCheckpointId: "save-status",
          },
          {
            id: "copy-targets",
            label: "Chép số lần và tải dự kiến sang các hiệp còn trống.",
            feedback:
              "Thông số trong giáo án chỉ là mục tiêu dự kiến. Các hiệp còn trống cần được xác minh.",
            criterionIds: [],
            nextCheckpointId: "save-status",
          },
        ],
      },
      {
        id: "save-status",
        prompt: "Bạn lưu buổi và hẹn bước tiếp theo thế nào?",
        criterionIds: ["status"],
        choices: [
          {
            id: "save-progress",
            label:
              "Lưu tiến độ và thống nhất lúc học viên sẽ bổ sung các hiệp còn thiếu.",
            feedback:
              "Buổi giữ trạng thái đang thực hiện cho đến khi có đủ kết quả.",
            criterionIds: ["status"],
            nextCheckpointId: null,
          },
          {
            id: "finish-anyway",
            label: "Đánh dấu đủ hiệp để đóng buổi ngay.",
            feedback: "Hãy lưu tiến độ khi chưa xác nhận đủ hiệp.",
            criterionIds: [],
            nextCheckpointId: null,
          },
        ],
      },
    ],
    limitations: [
      "Rubric dựa trên cách app phân biệt buổi trong giáo án, buổi tập và kết quả từng hiệp.",
    ],
    reviewedBy: null,
  },
];

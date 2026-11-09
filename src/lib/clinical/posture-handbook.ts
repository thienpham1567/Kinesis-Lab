import type { HandbookTopic } from "./movement-handbook";
import { MOVEMENT_SOURCES as S } from "./movement-sources";

export const POSTURE_TOPIC: HandbookTopic = {
  id: "posture",
  tab: "Đánh giá tư thế",
  kicker: "Posture correction",
  title: "Quan sát, điều chỉnh và kiểm tra lại",
  gist: "Quy trình đánh giá học viên trưởng thành. Hỏi mục tiêu, quan sát lúc đứng và khi vận động, thử một điều chỉnh rồi kiểm tra lại.",
  authored: true,
  keyPoints: [
    {
      title: "Quan sát giúp mô tả tư thế",
      text: "Ghi điều thấy được trong điều kiện cụ thể, chẳng hạn vai phải trông cao hơn khi đứng thả lỏng. Tổng quan về quan sát tư thế tĩnh tìm thấy ít dữ liệu về tính giá trị và chưa có dữ liệu về khả năng phát hiện thay đổi trong các nghiên cứu được đưa vào.",
      sourceIds: ["postureObservation"],
    },
    {
      title: "Ảnh đứng không xác định nguyên nhân đau",
      text: "Các tổng quan về tư thế cột sống và đau thắt lưng cho kết quả khác nhau, chưa thống nhất về quan hệ nhân quả. Mô tả ảnh đứng riêng với triệu chứng học viên kể và nhiệm vụ thực tế.",
      sourceIds: ["postureSpine"],
    },
    {
      title: "Sàng lọc trước khi yêu cầu vận động",
      text: "Hỏi về triệu chứng mới, tiền sử liên quan và hạn chế do nhân viên y tế hướng dẫn. Nếu có câu trả lời đáng lưu ý, xem hướng dẫn sàng lọc và quyết định có cần chuyển khám trước khi tiếp tục hay không.",
      sourceIds: ["postureScreen"],
    },
    {
      title: "Tách thay đổi hình dáng khỏi kết quả chức năng",
      text: "Trong tổng quan ở người khỏe, tập sức mạnh qua nhiều buổi cải thiện một số chỉ số tư thế vùng cổ và ngực. Phân tích vùng thắt lưng–chậu không cho thấy hiệu quả rõ, và nghiên cứu không chứng minh giảm đau nhờ thay đổi góc tư thế.",
      sourceIds: ["postureExercise"],
    },
  ],
  parts: [
    {
      id: "screening",
      label: "1. Hỏi trước khi quan sát",
      intro: "Xác định một việc học viên muốn làm tốt hơn, rồi xem họ có thể thử nhiệm vụ đó hôm nay không.",
      authored: true,
      items: [
        { lead: "Mục tiêu và triệu chứng.", text: "Hỏi việc nào đang khó, khi nào bắt đầu, vị trí và diễn biến triệu chứng, điều làm dễ hơn hoặc khó hơn. Hỏi thêm về chấn thương gần đây, mức vận động và hướng dẫn hạn chế hoạt động đang áp dụng.", sourceIds: ["postureScreen"], authored: true },
        { lead: "Hoãn bài thử và hỏi ý kiến y tế.", text: "Đau, tức hoặc khó chịu ở ngực khi sinh hoạt hằng ngày hay khi vận động, chóng mặt khi vận động, ngất hoặc mất ý thức, khó thở lúc nghỉ, hay đau hoặc sưng ở một vùng cơ thể làm hạn chế vận động là các ví dụ cần xem kỹ hướng dẫn sàng lọc. Tạm dừng đánh giá vận động nếu có dấu hiệu đáng lo đang xảy ra.", sourceIds: ["postureScreen"] },
        { lead: "Trợ giúp y tế ngay.", text: "Dừng buổi đánh giá và gọi cấp cứu nếu đau hoặc tức ngực đột ngột không hết. Làm tương tự nếu đau ngực lan tới tay, cổ, hàm, bụng hoặc lưng, hay kèm khó thở, vã mồ hôi, buồn nôn hoặc choáng. Đau thắt lưng nặng lan xuống chân kèm tê vùng đáy chậu mới xuất hiện hoặc thay đổi mới về tiểu tiện, đại tiện hay chức năng tình dục cũng cần đánh giá y tế ngay.", sourceIds: ["postureNhs", "postureNice"] },
        { lead: "Dấu hiệu chùm đuôi ngựa không chỉ đi kèm đau nặng.", text: "Trang thông tin của NHS liệt kê các dấu hiệu sau mà không đòi hỏi đau nặng: đau thần kinh tọa cả hai bên; yếu hoặc tê hai chân nặng hay tăng dần; tê quanh hoặc dưới bộ phận sinh dục hay quanh hậu môn; khó bắt đầu tiểu, không tiểu được hoặc không kiểm soát được tiểu tiện, đại tiện mà trước đây không có. Các dấu hiệu này cần cấp cứu tại bệnh viện.", sourceIds: ["postureCes"] },
      ],
    },
    {
      id: "standing",
      label: "2. Quan sát tư thế đứng từ ba hướng",
      intro: "Mời học viên đứng như thường ngày. Quan sát trước, ghi điều nhìn thấy và ghi ‘không rõ’ nếu góc nhìn không đủ.",
      sourceIds: ["postureObservation"],
      authored: true,
      illustration: {
        src: "/movement/posture-standing-views.svg",
        width: 960,
        height: 480,
        title: "Ba góc quan sát tư thế đứng",
        alt: "Ba hình đứng nhìn từ trước, bên và sau. Các vùng đánh dấu gồm vai, thân hoặc chậu, gối và bàn chân. Không có đường chuẩn hoặc số đo góc.",
        caption: "Sơ đồ do Kinesis Lab dựng để nhắc vị trí quan sát. Các dấu chỉ vùng nhìn, không dùng để căn một tư thế chuẩn hay đo mốc giải phẫu.",
      },
      items: [
        { lead: "Nhìn trước.", text: "Mô tả độ cao tương đối của vai, thân có nghiêng về một bên không, hướng gối và cách đặt bàn chân.", authored: true },
        { lead: "Nhìn bên.", text: "Ghi vị trí tương đối của đầu so với thân, cách thân và chậu đứng trên chân, cùng tư thế gối. Có thể quan sát bên còn lại nếu cần làm rõ.", authored: true },
        { lead: "Nhìn sau.", text: "So hai bên ở vai, đường viền vùng bả vai, thân và gót. Ghi khác biệt quan sát được, kèm hướng nhìn và bên của học viên.", authored: true },
        { lead: "Nếu dùng ảnh để đối chiếu.", text: "Xin phép trước khi chụp. Lặp lại vị trí máy, khoảng cách, hướng nhìn, cách đặt chân và hướng dẫn đứng. Dùng ảnh để đối chiếu mô tả. Muốn đo góc cần mốc, quy trình và dụng cụ đã được đánh giá phù hợp.", sourceIds: ["posturePhoto", "postureObservation"], authored: true },
      ],
    },
    {
      id: "tasks",
      label: "3. Quan sát khi học viên thực hiện nhiệm vụ",
      intro: "Chọn một nhiệm vụ gần với mục tiêu. Cho học viên làm thử ở mức họ thấy có thể kiểm soát, rồi ghi điều xảy ra thay vì chấm tư thế đạt hay rớt.",
      authored: true,
      illustration: {
        src: "/movement/posture-task-views.svg",
        width: 960,
        height: 470,
        title: "Hai nhiệm vụ mẫu để quan sát",
        alt: "Sơ đồ hai giai đoạn đứng lên từ ghế và hai vị trí đưa tay lên. Mũi tên chỉ thứ tự thực hiện; mỗi nhiệm vụ có thể dùng tầm vận động phù hợp với học viên.",
        caption: "Minh họa do Kinesis Lab dựng. Hai nhiệm vụ giúp quan sát theo mục tiêu, với độ cao ghế và tầm với được chọn cho từng học viên.",
      },
      items: [
        { lead: "Đứng lên từ ghế.", text: "Dùng ghế vững, ghi độ cao và việc có dùng tay hỗ trợ hay không. Quan sát thân, hai gối, bàn chân và lúc học viên báo khó chịu. Ví dụ ghi: ‘Ở ghế này, gối phải đi vào trong lúc vừa rời ghế ở hai lần quan sát’.", authored: true },
        { lead: "Đưa tay lên lấy đồ.", text: "Chọn tầm với phù hợp, ban đầu không cần tải. Ghi bên tay, độ cao đạt được, thân có ngả ra sau không và cảm nhận của học viên. Nếu nhiệm vụ không phù hợp, chọn một động tác gần với mục tiêu hơn.", authored: true },
        { lead: "Tách mô tả khỏi suy luận.", text: "Nghiên cứu squat một chân ở một nhóm phụ nữ hoạt động thể chất không thấy khác biệt sức mạnh hông giữa các nhóm được phân bằng quan sát. Trong mẫu đó, gối đi vào trong nhiều hơn có liên hệ vừa phải với mức kích hoạt cơ mông lớn thấp hơn, không liên hệ với sức mạnh hông đo được. Vì vậy gối đi vào trong không đủ để kết luận cơ mông yếu.", sourceIds: ["hollman"] },
      ],
    },
    {
      id: "adjust",
      label: "4. Thử một điều chỉnh và làm lại",
      intro: "Thử thay một yếu tố, giữ các điều kiện còn lại và lặp lại nhiệm vụ. So điều học viên làm được, độ dễ kiểm soát và triệu chứng.",
      authored: true,
      items: [
        { lead: "Nếu đứng lên khó ở ghế thấp.", text: "Thử ghế cao hơn với cùng vị trí chân và cách hỗ trợ. Nếu học viên đứng lên dễ hơn, dùng mức đó làm điểm bắt đầu. Có thể hạ dần độ cao khi học viên kiểm soát được và thấy phù hợp.", authored: true },
        { lead: "Nếu khó đưa tay đến kệ cao.", text: "Thử hạ mục tiêu xuống một mức, giữ cùng bên và tải. Hỏi tầm nào dùng được cho việc thường ngày, rồi chọn tầm tập phù hợp thay vì ép cánh tay hoặc lưng vào một góc cố định.", authored: true },
        { lead: "Nếu đã được đánh giá đau thắt lưng mạn nguyên phát.", text: "WHO xem chương trình tập có cấu trúc là một lựa chọn trong chăm sóc cá thể hóa. PT nên phối hợp với hướng dẫn của người điều trị nếu học viên đang được theo dõi, và chọn bài theo chức năng thay vì hình dáng ảnh đứng.", sourceIds: ["postureWho"], authored: true },
      ],
      note: "Một lần thử thấy dễ hơn giúp chọn cách tập hôm nay. Nó chưa xác nhận nguyên nhân triệu chứng hoặc hiệu quả lâu dài.",
    },
    {
      id: "record",
      label: "5. Ghi kết quả và hẹn kiểm tra lại",
      intro: "Dùng cùng nhiệm vụ và cách thiết lập khi muốn so sánh qua các buổi. Nếu đổi điều kiện, ghi rõ điều đã đổi.",
      authored: true,
      items: [
        { lead: "Mẫu ghi cho PT.", text: "Mục tiêu → nhiệm vụ, bên và điều kiện → điều quan sát → cảm nhận → thay đổi đã thử → đáp ứng → việc sẽ kiểm tra lại.", authored: true },
        { lead: "Ví dụ đã điền.", text: "Mục tiêu: đứng dậy khỏi ghế thấp. Quan sát: ghế 45 cm, dùng tay, học viên báo khó đứng lên. Thử: ghế 50 cm, giữ cách dùng tay. Kết quả: học viên báo dễ hơn. Buổi sau: dùng lại ghế 50 cm, cùng cách đặt chân và hỗ trợ để đối chiếu.", authored: true },
        { lead: "Chọn tiêu chí gắn với việc cần làm.", text: "Ví dụ ghi độ cao ghế, mức hỗ trợ, độ cao với tới, số lần làm được và cảm nhận. Đây là cách ghi huấn luyện, không quy đổi thành điểm tư thế hay nguy cơ chấn thương.", authored: true },
      ],
    },
  ],
  numbers: [],
  myths: [
    { say: "Đầu đưa ra trước chắc chắn gây đau cổ.", real: "Tổng quan ghi nhận liên hệ ở người trưởng thành trong các nghiên cứu cắt ngang. Dữ liệu đó chưa cho biết tư thế gây đau, đau làm đổi tư thế hay yếu tố khác ảnh hưởng cả hai.", sourceIds: ["postureNeck"] },
    { say: "Nhìn thấy chậu nghiêng là đủ để chọn cơ cần kéo giãn.", real: "Tổng quan ở người khỏe không tìm thấy hiệu quả rõ của kéo giãn lên các chỉ số tư thế được nghiên cứu.", sourceIds: ["postureExercise"] },
    { say: "Ảnh đứng cho biết cơ nào ‘căng’ hay ‘yếu’.", real: "Ảnh đứng chỉ ghi hình dáng tại một thời điểm. Bài học không gán cơ ‘căng’ hay ‘yếu’ từ ảnh. Muốn biết sức mạnh hay tầm vận động thì kiểm tra trực tiếp.", authored: true },
  ],
  apply: [
    { lead: "Tập phân biệt quan sát và diễn giải.", text: "Ghi một câu cho ảnh đứng, một câu cho nhiệm vụ và một câu cho phản hồi của học viên. Chọn một điều chỉnh để thử rồi quyết định có giữ lại hay không.", authored: true },
  ],
  quiz: [
    { q: "Vai phải trông cao hơn nhưng học viên không có triệu chứng và thực hiện được mục tiêu. Ghi gì?", a: "Ghi hướng quan sát và độ cao tương đối của vai. Hỏi thêm nếu khác biệt liên quan tới việc học viên muốn làm. Không suy nguyên nhân hay bắt buộc sửa cho cân chỉ từ hình dáng.", sourceIds: ["postureObservation"], authored: true },
    { q: "Thử ghế cao hơn thì học viên đứng lên dễ hơn. Kết quả này dùng để làm gì?", a: "Dùng để chọn độ cao bắt đầu và thiết lập lần kiểm tra lại. Bạn đã thấy đáp ứng với một điều kiện cụ thể, chưa xác định cơ nào gây khó khăn.", authored: true },
  ],
  sources: [S.postureObservation, S.postureSpine, S.postureScreen, S.postureExercise, S.posturePhoto, S.postureNhs, S.postureNice, S.postureCes, S.hollman, S.postureWho, S.postureNeck],
  anatomy: {
    regions: ["cervical", "shoulder", "thoracic_core", "hip_pelvis", "knee", "ankle_foot"],
    note: "Tra vị trí các vùng đã quan sát. Dùng mô hình để học tên và tương quan giải phẫu, còn đánh giá học viên dựa trên quan sát và phản hồi trong nhiệm vụ thật.",
    authored: true,
  },
};

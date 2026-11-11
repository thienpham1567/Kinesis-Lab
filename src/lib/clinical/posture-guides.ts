import type { HandbookGuide } from "./movement-handbook";

// Synthesized teaching workflows. Trial findings retain their own populations;
// these guides are not diagnostic tests or validated individual prescriptions.
export const POSTURE_GUIDES: HandbookGuide[] = [
  {
    id: "head-neck",
    title: "Đầu đưa trước, cổ nghiêng hoặc khó chịu khi nhìn màn hình",
    summary: "Bắt đầu từ việc nhìn, xoay đầu hoặc làm việc đang khó; ghi riêng vị trí đầu và triệu chứng.",
    authored: true,
    items: [
      { lead: "Quan sát và hỏi.", text: "Nhìn bên để ghi vị trí đầu so với thân; nhìn trước để mô tả nghiêng hoặc xoay. Hỏi khó chịu xuất hiện khi làm gì, sau bao lâu và có lan xuống tay không. Ghi ‘đầu trông đưa trước khi ngồi làm việc’ thay cho kết luận ‘đốt sống lệch’. Không áp một góc cổ lý tưởng cho tất cả học viên.", authored: true },
      { lead: "Kiểm tra thêm theo mục tiêu.", text: "Nếu mục tiêu là quay nhìn phía sau, ghi bên xoay, tầm dùng được và cảm nhận khi làm chậm. Nếu cần số độ, dùng quy trình ROM cổ phù hợp thay vì ước lượng bằng mắt. Góc sọ–đốt sống (CVA) và góc đầu đưa trước của các nghiên cứu có định nghĩa khác nhau; không đổi ngưỡng giữa chúng.", sourceIds: ["posturePhoto", "postureUpperTrial"], authored: true },
      { lead: "Bằng chứng nói gì?", text: "Tổng quan 2019 thấy liên hệ giữa đầu đưa trước và đau cổ ở người trưởng thành, chủ yếu từ nghiên cứu cắt ngang. Tổng quan RCT 2026 tìm thấy cải thiện một số góc tư thế sau tập, nhưng kết quả đau/chức năng chưa nhất quán; bằng chứng về đau có độ chắc chắn rất thấp. Không biết chỉ từ ảnh liệu tư thế gây đau hay đau làm đổi tư thế.", sourceIds: ["postureNeck", "postureUcs"] },
      { lead: "Thử điều chỉnh ngay.", text: "Chọn một thay đổi: dùng tựa lưng, đổi vị trí màn hình, hoặc nhẹ đưa đầu lùi trong tầm dễ chịu. Không ép cổ hoặc cúi cằm sát ngực. Giữ cùng nhiệm vụ và thời gian quan sát để thử lại. Nếu dễ chịu hơn, ghi đó là đáp ứng với cách thiết lập này; chưa kết luận đã sửa nguyên nhân.", authored: true },
      { lead: "Lựa chọn tập và theo dõi.", text: "Khi phù hợp, có thể luyện kiểm soát cổ và bài sức mạnh vai/lưng trong kế hoạch cá thể hóa; thử nghiệm Seidi dùng cả chương trình có giám sát, không chứng minh riêng một động tác rút cằm chữa đau. Theo dõi khả năng nhìn/xoay đầu, thời gian làm việc và cảm nhận, bên cạnh số đo ảnh nếu có quy trình. Đối chiếu hướng dẫn sàng lọc khi xuất hiện triệu chứng mới.", sourceIds: ["postureUpperTrial"], authored: true },
    ],
  },
  {
    id: "shoulder",
    title: "Vai đưa trước, hai vai khác độ cao hoặc bả vai trông khác nhau",
    summary: "So sánh khi nghỉ với một nhiệm vụ với tay; tránh gán cơ yếu chỉ từ đường viền bả vai.",
    authored: true,
    items: [
      { lead: "Quan sát.", text: "Ghi bên học viên, góc nhìn, độ cao tương đối hai vai và đường viền bả vai. Sau đó chọn nhiệm vụ cụ thể như đưa tay lên kệ: ghi bên tay, độ cao, tải và thời điểm khó chịu. Thân ngả ra sau hay vai nhô lên là mô tả chuyển động, chưa phải chẩn đoán chèn ép hoặc yếu cơ răng trước.", authored: true },
      { lead: "Thử trước khi chọn bài.", text: "So cùng nhiệm vụ khi giảm độ cao mục tiêu hoặc giảm tải, mỗi lần chỉ đổi một yếu tố. Hỏi điều gì dễ hơn và học viên có hoàn thành việc cần làm không. Nếu nghi hạn chế ROM hoặc sức mạnh, cần đo trực tiếp bằng phương pháp phù hợp, không suy từ ảnh đứng.", authored: true },
      { lead: "Bài luyện xoay ngoài vai.", text: "Ví dụ học động tác: giữ khuỷu gần thân, xoay cẳng tay ra ngoài trong tầm kiểm soát rồi trở về chậm; có thể thử không tải trước, sau đó chọn dây/tạ phù hợp. Tránh xoay cả thân để thay cho chuyển động vai. Đây là ví dụ app biên soạn từ một nhóm bài trong nghiên cứu, không là giao thức nguyên bản hoặc bảo đảm sửa vai tròn.", sourceIds: ["postureUpperTrial"], authored: true },
      { lead: "Liều thực sự đã được nghiên cứu.", text: "Seidi nghiên cứu 24 nam 18–28 tuổi: chương trình có giám sát 8 tuần, 3 buổi/tuần, khoảng 1 giờ/buổi, gồm nhiều bài kiểm soát và sức mạnh. Một số chỉ số góc, hoạt động cơ và chuyển động bả vai cải thiện. Mẫu nhỏ, chỉ nam trẻ; không chứng minh giảm đau hoặc hiệu quả độc lập của một bài xoay ngoài.", sourceIds: ["postureUpperTrial"] },
      { lead: "Đo lại.", text: "Dùng cùng độ cao kệ, bên tay và tải; ghi tầm đạt được, mức hỗ trợ và cảm nhận. Tăng yêu cầu tập từng bước theo đáp ứng đã quan sát, thay vì bắt học viên giữ vai kéo ra sau suốt ngày. Nếu cần đánh giá bệnh lý vai hoặc triệu chứng kéo dài, phối hợp người có chuyên môn phù hợp.", authored: true },
    ],
  },
  {
    id: "thoracic",
    title: "Lưng ngực cong hơn hoặc khó vươn người, với tay",
    summary: "Đánh giá khả năng thực hiện nhiệm vụ và đáp ứng khi đổi vị trí; ảnh không cho biết tình trạng xương.",
    authored: true,
    items: [
      { lead: "Mô tả và kiểm tra thêm.", text: "Ghi đường viền lưng ngực nhìn bên trong tư thế nghỉ và khi học viên chủ động vươn người nhẹ. Hỏi tiền sử chấn thương, bệnh xương và hạn chế được nhân viên y tế hướng dẫn. Không gọi đó là loãng xương hoặc gãy lún chỉ từ hình dáng; cũng không ép mọi đường cong thành thẳng.", authored: true },
      { lead: "Chọn nhiệm vụ để thử.", text: "Ví dụ chọn với tay tới một độ cao cố định. So khi ngồi có tựa và vươn thân nhẹ trong tầm dễ chịu; giữ nguyên bên tay và tải. Ghi kết quả với tay và cảm nhận trước/sau. Đây là phép thử chọn cách vận động, không là phép đo Cobb hoặc test phát hiện gãy xương.", authored: true },
      { lead: "Bằng chứng về tập.", text: "SHEAF phân ngẫu nhiên 99 người sống cộng đồng từ 60 tuổi, có tăng gù ngực và đã qua sàng lọc: tập sức mạnh cột sống, vận động và huấn luyện tư thế do chuyên viên dẫn, 1 giờ × 3 buổi/tuần trong 6 tháng. Mức thay đổi góc Cobb giữa hai nhóm là −3,0° (CI 95%: −5,2 đến −0,8). Các phép đo chức năng và thay đổi đau không cải thiện có ý nghĩa giữa nhóm.", sourceIds: ["postureKyphosis"] },
      { lead: "Ứng dụng phù hợp.", text: "Có thể thảo luận kế hoạch sức mạnh vùng lưng và luyện nhiệm vụ khi đã sàng lọc phù hợp. Chương trình nhiều thành phần có giám sát không biến thành một bài ‘ưỡn lưng’ chung cho mọi người. Khi có bệnh xương hoặc giới hạn của người điều trị, lựa chọn động tác phải theo đánh giá cá nhân.", sourceIds: ["postureKyphosis"], authored: true },
      { lead: "Đo lại.", text: "Theo dõi độ cao với tới, khả năng thực hiện hoạt động cần thiết và cảm nhận. Nếu đo đường cong, ghi đúng phương pháp: góc Cobb trên X-quang không tương đương góc trên ảnh điện thoại hoặc dụng cụ ngoài da. Không tự yêu cầu chụp X-quang chỉ để theo dõi buổi tập.", sourceIds: ["postureKyphosis"], authored: true },
    ],
  },
  {
    id: "pelvis",
    title: "Chậu trông nghiêng trước, lưng ưỡn hoặc thân lệch bên",
    summary: "Ưu tiên vấn đề chức năng; chưa có một công thức kéo giãn–tăng sức mạnh để ‘đặt lại chậu’ cho mọi người.",
    authored: true,
    items: [
      { lead: "Ghi điều nhìn thấy.", text: "Ghi tư thế chân, hướng máy và vị trí tương đối của thân trên hai chân. Đường viền da, bụng hoặc quần áo không phải số đo chính xác của góc chậu. Nếu sờ mốc gai chậu sau trên (PSIS), lưu ý tổng quan ghi nhận độ đồng thuận giữa người khám thấp; không dùng một mốc để khẳng định chậu xoay hoặc khớp cùng chậu ‘sai vị trí’.", sourceIds: ["posturePelvisPalpation"], authored: true },
      { lead: "Liên hệ với đau lưng.", text: "Tổng quan 2025 (online 2024) thấy nghiêng chậu có khác biệt nhỏ giữa nhóm đau lưng và nhóm chứng, nhưng dị biệt giữa nghiên cứu cao và chưa thể kết luận chắc. Đây là so sánh nhóm quan sát, không phải ngưỡng chẩn đoán, nguyên nhân đau hoặc mục tiêu góc cho một học viên.", sourceIds: ["postureAsymmetry"] },
      { lead: "Bằng chứng về ‘sửa nghiêng chậu’.", text: "Tổng quan Brekke chỉ có 2 RCT và 2 nghiên cứu không đối chứng, với độ chắc chắn rất thấp; chưa hỗ trợ một cách điều trị chung. Tổng quan Warneke ở người khỏe cũng chưa thấy hiệu quả rõ trong phân nhóm thắt lưng–chậu, nhưng riêng phân nhóm tập sức mạnh vùng thắt lưng–chậu chỉ có 2 nghiên cứu. Chưa thấy hiệu quả rõ không đồng nghĩa chứng minh mọi bài tập đều vô ích.", sourceIds: ["posturePelvicExercise", "postureExercise"] },
      { lead: "Thử một nhiệm vụ có ích.", text: "Nếu mục tiêu là cúi lấy đồ, thử gập hông có tay tựa ghế: đưa hông ra sau trong tầm kiểm soát, rồi đứng lên. Giữ vật hoặc mục tiêu gần với yêu cầu thực tế. So mức hỗ trợ, tầm với và cảm nhận. Chọn bài sức mạnh hoặc ROM theo kết quả đo và mục tiêu, không theo sơ đồ mặc định ‘gập hông căng–bụng yếu’.", authored: true },
      { lead: "Đo lại và phối hợp.", text: "Lặp lại cùng nhiệm vụ/điều kiện và ghi việc học viên làm được. Với đau thắt lưng mạn nguyên phát đã được đánh giá, WHO xem tập có cấu trúc là một lựa chọn trong chăm sóc cá thể hóa; hướng dẫn đó không xác nhận bài gập hông này sẽ sửa góc chậu hay chữa đau.", sourceIds: ["postureWho"], authored: true },
    ],
  },
  {
    id: "knee",
    title: "Gối đi vào trong khi squat, đứng lên hoặc bước xuống",
    summary: "Tên nhiệm vụ và giai đoạn xảy ra quan trọng hơn một nhãn ‘gối valgus’; thử nghiệm giúp chọn cách tập.",
    authored: true,
    items: [
      { lead: "Quan sát có thể lặp lại.", text: "Ghi chân, độ sâu hoặc độ cao ghế/bậc, tải, hỗ trợ tay và lúc gối đi vào trong. Ví dụ: ‘gối phải đi vào trong khi vừa rời ghế ở hai lần quan sát’. Ghi riêng có đau hay không. Đầu gối nhìn lệch trong ảnh hai chiều không cho biết toàn bộ chuyển động ba chiều.", authored: true },
      { lead: "Đừng đoán cơ gây ra.", text: "Trong mẫu nghiên cứu single-leg squat ở phụ nữ hoạt động thể chất, nhóm được phân bằng quan sát không khác sức mạnh hông đo được. Vì vậy cần đo nếu câu hỏi là sức mạnh, và có thể xem ROM cổ chân bằng quy trình phù hợp nếu nó liên quan đến nhiệm vụ. Không tự kết luận ‘mông giữa yếu’ từ đường đi của gối.", sourceIds: ["hollman"], authored: true },
      { lead: "Thử điều chỉnh.", text: "Dùng điểm tựa hoặc ghế để chọn tầm kiểm soát được. Thử giảm độ sâu, giảm tải hoặc một hướng dẫn nhẹ về hướng gối; mỗi lượt chỉ đổi một yếu tố. Lặp lại và ghi kiểm soát, cảm nhận và nhiệm vụ có hoàn thành không. Một cách đặt chân dễ hơn không xác định nguyên nhân đau.", authored: true },
      { lead: "Bằng chứng và giới hạn.", text: "Bell nghiên cứu 32 người được chọn vì valgus khi squat giảm với kê gót. Sau 10 buổi có giám sát kết hợp bài hông, cổ chân và nhiệm vụ thăng bằng/squat, một số số đo chuyển động và gập mu cổ chân đo khi duỗi gối cải thiện; thay đổi sức mạnh hông không có ý nghĩa. Không có kết quả về giảm tỷ lệ chấn thương, và không biết thành phần nào quyết định tác dụng.", sourceIds: ["postureKneeTrial"] },
      { lead: "Đo lại.", text: "Lặp lại cùng ghế/bậc, giày, tải và góc quan sát; ghi lúc lệch gối xảy ra, mức kiểm soát và cảm nhận. Theo dõi cả năng lực ở nhiệm vụ thật, không chỉ video đẹp hơn. Các ngưỡng chấn thương hoặc giấy phép trở lại thể thao không được tạo từ bài quan sát này.", authored: true },
    ],
  },
  {
    id: "foot",
    title: "Vòm chân thấp, gót nghiêng hoặc khó tiến gối về trước",
    summary: "Phân biệt hình dạng bàn chân, ROM cổ chân và triệu chứng; không mặc định vòm thấp cần được nâng bằng tập hay đế.",
    authored: true,
    items: [
      { lead: "Quan sát rồi đặt câu hỏi.", text: "Ghi hướng chân, gót, vòm dọc trong, giày và khác biệt khi có/không chịu tải. Hỏi có khó chịu khi đứng, đi hoặc tập không. FPI-6 là quy trình sáu mục; một ảnh sau gót không đủ để chấm điểm. Trong mẫu 619 người trưởng thành khỏe, bàn chân hơi sấp khi nghỉ là phổ biến, với biến thiên rộng.", sourceIds: ["postureFootIndex"], authored: true },
      { lead: "Khi câu hỏi là ROM cổ chân.", text: "Có thể dùng knee-to-wall nếu học viên phù hợp với bài chịu trọng lượng. Ghi khoảng ngón cái–tường, bên và điều kiện; xem quy trình ở mục Phép thử. Khoảng nhỏ không tự xác định cơ bắp chân ngắn, cứng khớp hoặc nguyên nhân đau, và không đặt mục tiêu 10 cm chung cho mọi người.", sourceIds: ["postureLunge"], authored: true },
      { lead: "Kỹ thuật short-foot.", text: "Khi đã chọn tập phù hợp: ngồi, đặt chân trên sàn; nhẹ kéo vùng đầu xương bàn chân thứ nhất về phía gót để bàn chân ngắn lại, giữ các ngón không quặp. Thả ra rồi lặp lại. Kiểm tra khả năng thực hiện trước khi chuyển sang đứng hoặc đứng một chân. Đây là kỹ thuật trong thử nghiệm ở bàn chân bẹt mềm có triệu chứng, không phải cách bắt buộc ‘sửa’ mọi vòm chân thấp.", sourceIds: ["postureFootTrial"] },
      { lead: "Liều và kết quả nghiên cứu.", text: "Elsayed phân ngẫu nhiên 40 người: 6 tuần tập short-foot kèm đế so với chỉ đế. Bài tập giữ 5 giây, 3 hiệp × 10 lần mỗi ngày, nghỉ 1 phút; tiến từ ngồi sang đứng rồi một chân mỗi 2 tuần. Nhóm thêm tập có kết quả đau/chức năng tốt hơn, nhưng navicular drop giảm tương tự ở hai nhóm. Liều đó thuộc thử nghiệm có đế, không phải bằng chứng tập đơn thuần hoặc tái tạo vòm vĩnh viễn.", sourceIds: ["postureFootTrial"] },
      { lead: "Đo lại.", text: "Theo dõi khả năng đứng/đi hoặc bài tập cần thiết và cảm nhận, bên cạnh số đo nếu có. Ghi bài và liều đã thực hiện. Không chỉ định đế từ một ảnh; trường hợp đau, thay đổi hình dạng mới hoặc khó thực hiện mục tiêu cần được đánh giá phù hợp trước khi chọn can thiệp.", authored: true },
    ],
  },
];

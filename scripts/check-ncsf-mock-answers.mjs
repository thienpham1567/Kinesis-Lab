import assert from "node:assert/strict";
import test from "node:test";
import { shuffleMockExam } from "../src/lib/ncsf-mock-exams.ts";
import * as helpers from "../src/lib/ncsf-mock-answers.ts";
const bank = () => ({
  version: 1, checkedAt: "2026-10-29",
  exams: [1, 2].map((id) => ({ id, questions: Array.from({length:150}, (_, i) => ({
    position:i+1, title:`Câu ${i+1}: Ví dụ ${id}`,
    options:i===123 ? ["A. Một", "B. Hai", "C. Ba"] : ["A. Một", "B. Hai", "C. Ba", "D. Bốn"],
    images:i===4 ? [{index:1, alt:"Hình nguồn",width:100,height:150}] : [],
  }))})),
});
const key = (source = bank()) => ({
  version:1, checkedAt:"2026-10-30",official:false,
  exams:source.exams.map((exam)=>({id:exam.id,answers:exam.questions.map((q,i)=>({
    position:q.position, sourceTitle:q.title,sourceOptions:[...q.options],answer:i%q.options.length,
    explanation:"Giải thích có nguồn.",notes:"",qualified:i===2,
    sources:[{title:"Tài liệu",url:"https://example.org/reference",locator:"Mục 1",checkedAt:"2026-10-30",scope:"Toàn văn"}],
    ...(i===0 ? {correction:{title:"Ví dụ đã làm rõ",options:["A. Mới một","B. Mới hai"],reason:"Làm rõ ngữ cảnh câu gốc."},answer:1} : {}),
  }))})),
});
test("complete answer key validates its own schema and rejects unsafe or unrelated payloads",()=>{

  const k=key();
  assert.deepEqual(helpers.parseMockAnswerKey(k),k);
  for(const mutate of [
    k=>k.exams.pop(), k=>k.exams[0].answers.pop(), k=>k.exams[1].id=1,
    k=>k.exams[0].answers[1].position=1,k=>k.official=true,k=>k.checkedAt="2026-02-31",
    k=>k.exams[0].answers[0].answer=2,k=>k.exams[0].answers[123].answer=3,
    k=>k.exams[0].answers[0].correction.options=["Only one"],
    k=>k.exams[0].answers[0].sources[0].url="javascript:alert(1)",
    k=>k.exams[0].answers[0].sources[0].url="https://secret:password@example.org/",
    k=>k.exams[0].answers[0].sources[0].checkedAt="2026-02-31",
    k=>k.exams[0].answers[0].sources=[],k=>k.exams[0].answers[0].qualified="true",
    k=>k.exams[0].answers[0].sourceOptions=["Only one"],
    k=>k.exams[0].answers[0].draftEmail="private@example.org",k=>k.email="private@example.org",
  ]) {const bad=key();mutate(bad);assert.equal(helpers.parseMockAnswerKey(bad),null);}
  assert.equal(helpers.parseMockAnswerKey(null),null);
});
test("practice requires every original source title and option in the exact source position",()=>{

  const b=bank(),k=key(b),before=structuredClone({b,k});
  const practice=helpers.prepareMockPractice(b,k);
  assert.ok(practice);
  assert.equal(practice.checkedAt,k.checkedAt);
  assert.equal(practice.exams[0].questions[0].title,"Ví dụ đã làm rõ");
  assert.deepEqual(practice.exams[0].questions[0].options,k.exams[0].answers[0].correction.options);
  assert.deepEqual(practice.exams[0].questions[0].original,{title:b.exams[0].questions[0].title,options:b.exams[0].questions[0].options,reason:k.exams[0].answers[0].correction.reason});
  assert.equal(practice.exams[0].questions[0].answer,1);
  assert.equal(practice.exams[0].questions[2].qualified,true);
  assert.deepEqual(practice.exams[0].questions[4].images,b.exams[0].questions[4].images);
  assert.equal(practice.exams[1].questions[123].options.length,3);
  assert.deepEqual({b,k},before);
  for(const mutate of [
    k=>k.exams[0].answers[149].sourceTitle+=" changed",
    k=>k.exams[1].answers[123].sourceOptions.reverse(),
    k=>[k.exams[0].answers[2],k.exams[0].answers[3]]=[k.exams[0].answers[3],k.exams[0].answers[2]],
  ]) {const invalid=key(b);mutate(invalid);assert.equal(helpers.prepareMockPractice(b,invalid),null);}
});
test("grading uses source indices and clarified choices through repeated question and option shuffles",()=>{

  const b=bank(),exam=helpers.prepareMockPractice(b,key(b)).exams[1];
  const picks={};
  let previous;
  for(let attempt=0;attempt<4;attempt++) {
    const order=shuffleMockExam(exam,previous,()=>0.25);previous=order;
    for(const sourceIndex of order.questions) {
      const q=exam.questions[sourceIndex];
      const shownCorrect=order.options[sourceIndex].indexOf(q.answer);
      picks[sourceIndex]=order.options[sourceIndex][shownCorrect];
    }
    assert.deepEqual(helpers.gradeMockExam(exam,picks),{correct:150,wrong:0,unanswered:0,total:150,answered:150});
  }
  picks[0]=0; delete picks[1]; picks[123]=3; picks[3]=-1; picks[4]=NaN;picks[150]=1;
  assert.deepEqual(helpers.gradeMockExam(exam,picks),{correct:145,wrong:1,unanswered:4,total:150,answered:146});
  assert.deepEqual(helpers.gradeMockExam(exam,{}),{correct:0,wrong:0,unanswered:150,total:150,answered:0});
});
test("feedback remaps option labels without changing vitamin names, scientific terms or content",()=>{
  const order=[2,0,3,1];
  assert.equal(helpers.mockFeedbackText("Đáp án B là phù hợp. A mô tả ví dụ; phương án C khác D.",order),"Đáp án D là phù hợp. B mô tả ví dụ; phương án A khác D.");
  assert.equal(helpers.mockFeedbackText("C khớp dữ kiện. Vì vậy B là lựa chọn phù hợp; lựa chọn A/B.",order),"A khớp dữ kiện. Vì vậy D là lựa chọn phù hợp; lựa chọn B/D.");
  assert.equal(helpers.mockFeedbackText("Vitamin D là dưỡng chất; vitamin C và A. CNS, BCAA và loại A vẫn giữ nguyên.",order),"Vitamin D là dưỡng chất; vitamin C và A. CNS, BCAA và loại A vẫn giữ nguyên.");
  assert.equal(helpers.mockFeedbackText("Đáp án C. Vitamin D.",[1,2,0]),"Đáp án B. Vitamin D.");
});
test("answer endpoint authenticates before reads, sanitizes failures and never caches private content",async()=>{
  let reads=0;
  const download=async(objectKey)=>{reads++;assert.equal(objectKey,"mock-answers.json");return{data:new Blob([JSON.stringify(key())]),error:null};};
  const denied=await helpers.serveMockAnswers({isAuthed:async()=>false,download});
  assert.equal(denied.status,401);assert.equal(reads,0);
  const good=await helpers.serveMockAnswers({isAuthed:async()=>true,download});
  assert.equal(good.status,200);assert.deepEqual(await good.json(),key());
  for(const response of [denied,good]) {
    assert.equal(response.headers.get("Cache-Control"),"private, no-store");
    assert.equal(response.headers.get("Vary"),"Cookie");
    assert.equal(response.headers.get("X-Content-Type-Options"),"nosniff");
  }
  const missing=await helpers.serveMockAnswers({isAuthed:async()=>true,download:async()=>({data:null,error:null})});assert.equal(missing.status,404);
  const invalid=await helpers.serveMockAnswers({isAuthed:async()=>true,download:async()=>({data:new Blob(["{}"]),error:null})});assert.equal(invalid.status,503);
  const failed=await helpers.serveMockAnswers({isAuthed:async()=>true,download:async()=>{throw Error("private credential");}});assert.equal(failed.status,503);assert.doesNotMatch(await failed.text(),/credential/);
});
test("feedback covers indirect references and expands original ranges into their shuffled members",()=>{
  const order=[2,0,3,1];
  assert.equal(helpers.mockFeedbackText("D vượt ngưỡng ví dụ; C chỉ là giả định. Nên B phù hợp, theo cách A mô tả. Phù hợp với B, như C.",order),"C vượt ngưỡng ví dụ; A chỉ là giả định. Nên D phù hợp, theo cách B mô tả. Phù hợp với D, như A.");
  assert.equal(helpers.mockFeedbackText("Các lựa chọnA–C khác các lựa chọn B–D.",order),"Các lựa chọn B, D, A khác các lựa chọn D, A, C.");
  const scientific="Vitamin D là lựa chọn minh họa; vitamin C và A là tên minh họa. HDL-C là ký hiệu; loại A vẫn giữ nguyên. Không phải mọi lựa chọn có nội dung giống nhau.";
  assert.equal(helpers.mockFeedbackText(scientific,order),scientific);
});

const { exportMockAnswerKey, sha256 } = await import("./ncsf-mock-answer-export.mjs");
function exportFixture(mutate = () => {}) {
  const source=bank(), bankBytes=Buffer.from(JSON.stringify(source));
  const sourceReference={title:"Tài liệu",url:"https://example.org/reference",locator:"Mục 1",checkedAt:"2026-10-30",scope:"Toàn văn"};
  const cases=Array.from({length:20},(_,i)=>({id:`u${i%20}`,scientificAnswer:"Kết luận ví dụ.",explanation:"Đối chiếu ví dụ.",reasonAgainstOtherOptions:"Lý do ví dụ.",sources:[sourceReference]}));
  const rows=source.exams.map((exam,examIndex)=>({id:exam.id,questions:exam.questions.map((q,i)=>{
    const index=examIndex*150+i;
    return {id:`E${exam.id}-Q${String(q.position).padStart(3,"0")}`,examId:exam.id,sourcePosition:q.position,sourceQuestionTitle:q.title,sourceOptions:q.options,images:q.images,uniqueQuestionId:`u${index<22?index%20:index}`,status:index<22?"ambiguous":index<133?"qualified":"supported",answerIndex:index<22?null:0,excludeFromSingleAnswerGrading:index<22,explanation:"Giải thích ví dụ.",notes:"",sources:[sourceReference]};
  })}));
  const research={version:2,officialNcsfKey:false,reviewedBy:null,compiledAt:"2026-10-30",sourceBankSha256:sha256(bankBytes),sourceQuestionCount:300,exams:rows,deepResearchCases:cases,proposedQuestionRevisions:rows.flatMap(e=>e.questions).slice(0,22).map(q=>({originalId:q.id,uniqueQuestionId:q.uniqueQuestionId,sourcePosition:q.sourcePosition,originalQuestionTitle:q.sourceQuestionTitle,originalOptions:q.sourceOptions,requiresQuestionTextChange:true,appliedToOriginal:false,stem:"Ví dụ đã làm rõ",options:["A. Mới một","B. Mới hai"],answerIndex:1}))};
  const overrides={preparedAt:research.compiledAt,explanations:Object.fromEntries(cases.map(c=>[c.id,"Giải thích mới có nguồn."]))};
  mutate({source,research,overrides});
  const researchBytes=Buffer.from(JSON.stringify(research));
  return [Buffer.from(JSON.stringify(source)),researchBytes,{sourceKeySha256:sha256(researchBytes),...overrides}];
}
test("private exporter creates all300aligned practice keys with22clarifications and111qualifications",()=>{
  const input=exportFixture();const before=input.map(value=>JSON.stringify(value));
  const result=exportMockAnswerKey(...input);
  assert.equal(result.clarified,22);assert.equal(result.qualified,111);
  assert.equal(result.value.official,false);
  assert.equal(result.value.exams.reduce((n,e)=>n+e.answers.length,0),300);
  assert.equal(result.value.exams[0].answers[0].answer,1);
  assert.equal(result.value.exams[0].answers[0].sourceOptions.length,4);
  assert.equal(result.value.exams[0].answers[0].correction.options.length,2);
  assert.deepEqual(input.map(value=>JSON.stringify(value)),before);
});
test("private exporter rejects source drift, wrong hashes and invented official or professional review metadata",()=>{
  for(const mutate of [
    ({source})=>source.exams[0].questions[0].title+=" changed",
    ({research})=>research.sourceBankSha256="0".repeat(64),
    ({overrides})=>overrides.sourceKeySha256="0".repeat(64),
    ({research})=>research.exams[0].questions[0].sourceQuestionTitle+=" changed",
    ({research})=>research.exams[0].questions[4].images=[],
    ({research})=>research.officialNcsfKey=true,
    ({research})=>research.reviewedBy="Invented reviewer",
  ]) {
    assert.throws(()=>exportMockAnswerKey(...exportFixture(mutate)));
  }
});
test("private exporter requires every repair, research case, qualification and explanation override",()=>{
  for(const mutate of [
    ({research})=>research.proposedQuestionRevisions.pop(),
    ({research})=>research.proposedQuestionRevisions[1]=research.proposedQuestionRevisions[0],
    ({research})=>research.deepResearchCases.pop(),
    ({overrides})=>delete overrides.explanations.u0,
    ({overrides})=>overrides.explanations.u0="",
    ({research})=>research.exams[0].questions[22].status="supported",
    ({research})=>research.exams[0].questions[22].excludeFromSingleAnswerGrading=true,
    ({research})=>research.proposedQuestionRevisions[0].answerIndex=2,
    ({research})=>research.exams[1].questions[123].answerIndex=3,
  ]) assert.throws(()=>exportMockAnswerKey(...exportFixture(mutate)));
});
test("private exporter requires actual boolean clarification flags",()=>{
  for(const mutate of [
    ({research})=>research.proposedQuestionRevisions[0].requiresQuestionTextChange="true",
    ({research})=>research.exams[0].questions[0].excludeFromSingleAnswerGrading="true",
  ]) assert.throws(()=>exportMockAnswerKey(...exportFixture(mutate)));
});

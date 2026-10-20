import type { Client } from "../types.ts";
import { pubmedQuery } from "../tools/pubmed.ts";
import { safetyNotes } from "./safety.ts";

const client: Client = {
  id: "1",
  name: "Test",
  age: 48,
  sex: "nam",
  goals: "giảm đau lưng",
  training_level: "trung cấp",
  medical_conditions: [{ name: "thoát vị đĩa đệm L4-L5" }],
  medications: [{ name: "bisoprolol 5mg" }],
  orthopedic_issues: [{ region: "thắt lưng", painTriggers: "flexion có tải" }],
  red_flags: { parq: { chest: false, red_night: false } },
  notes: null,
  created_at: "",
  updated_at: "",
};

const notes = safetyNotes(client);
if (!notes.includes("Beta-blocker")) throw new Error("missing beta-blocker note");
if (!notes.includes("Cột sống")) throw new Error("missing disc note");

const q = pubmedQuery("học viên thoát vị đĩa đệm có deadlift được không");
if (!q.includes("intervertebral disc herniation")) throw new Error("pubmed query miss");

console.log("ok");

const medicationNote = (name: string) => safetyNotes({ ...client, medical_conditions: [], medications: [{name}] });
if (/nguy cơ hạ đường/.test(medicationNote("metformin"))) throw new Error("metformin alone misclassified");
if (!medicationNote("insulin").includes("hạ đường")) throw new Error("missing insulin hypoglycemia risk");
if (!medicationNote("aspirin").includes("kháng tiểu cầu")) throw new Error("antiplatelet misclassified");
if (notes.includes("McGill Big 3")) throw new Error("keyword must not prescribe universal rehab");
if (medicationNote("nitroglycerin").includes("nếu không đỡ")) throw new Error("emergency escalation must not wait");

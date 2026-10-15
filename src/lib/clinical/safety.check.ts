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

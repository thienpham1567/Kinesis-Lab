import { changeVsPrevious, normFor, sideGap } from "./rom-norms.ts";

function assert(ok: boolean, msg: string) {
  if (!ok) throw new Error(msg);
}

const adultMale = normFor("knee_flexion", 42, "Nam");
assert("mean" in adultMale && adultMale.mean === 137.7, "male 20–44 knee flexion");

const olderFemale = normFor("ankle_dorsiflexion", 50, "Nữ");
assert("mean" in olderFemale && olderFemale.mean === 11.6, "female 45–69 dorsiflexion");

const over69 = normFor("hip_flexion", 75, "nam");
assert("mean" in over69 && over69.mean === 127.2 && over69.population.includes("ngoài"), "age > 69 uses last band");

assert("reason" in normFor("knee_flexion", null, "Nam"), "missing age has no norm");
assert("reason" in normFor("knee_flexion", 30, "khác"), "unknown sex has no norm");
assert("reason" in normFor("knee_flexion", 1, "Nam"), "age < 2 has no norm");

const spine = normFor("lumbar_flexion", null, null);
assert("mean" in spine && spine.mean === 69.9, "spine norm needs no age/sex");

assert(sideGap(120, 135) === 15, "side gap");

const small = changeVsPrevious("knee_flexion", "goniometer", 100, 106);
assert(small.mdc === 9.4 && small.beyondError === false, "6° knee change is within error");
const big = changeVsPrevious("knee_flexion", "goniometer", 100, 112);
assert(big.beyondError === true, "12° knee change exceeds error");
assert(changeVsPrevious("hip_flexion", "goniometer", 100, 130).beyondError === null, "no SEM → null");

console.log("ok");

import { changeVsPrevious, normFor, sideGap } from "./rom-norms.ts";

function assert(ok: boolean, msg: string) {
  if (!ok) throw new Error(msg);
}

const adultMale = normFor("knee_flexion", 42, "Nam");
assert("mean" in adultMale && adultMale.mean === 137.7, "male 20–44 knee flexion");

const olderFemale = normFor("ankle_dorsiflexion", 50, "Nữ");
assert("mean" in olderFemale && olderFemale.mean === 11.6, "female 45–69 dorsiflexion");

const over69 = normFor("hip_flexion", 75, "nam");
assert("reason" in over69, "age > 69 must not extrapolate CDC means");

assert("reason" in normFor("knee_flexion", null, "Nam"), "missing age has no norm");
assert("reason" in normFor("knee_flexion", 30, "khác"), "unknown sex has no norm");
assert("reason" in normFor("knee_flexion", 1, "Nam"), "age < 2 has no norm");

const spine = normFor("lumbar_flexion", null, null);
assert("reason" in spine, "spine norm needs study age range");
assert("reason" in normFor("lumbar_flexion", 55, "Nam"), "spine reference excludes older adults");
assert("mean" in normFor("lumbar_flexion", 21, "Nam"), "spine mean available within 18–29 years");
assert("reason" in normFor("hip_flexion", NaN, "Nam"), "nonfinite age rejected");

assert(sideGap(120, 135) === 15, "side gap");

const small = changeVsPrevious("knee_flexion", "goniometer", 100, 106);
assert(small.mdc === null && small.beyondError === null, "generic instrument does not establish study-specific MDC");
const big = changeVsPrevious("knee_flexion", "goniometer", 100, 112);
assert(big.delta === 12 && big.beyondError === null, "change preserved without claiming clinical improvement");
assert(changeVsPrevious("hip_flexion", "goniometer", 100, 130).beyondError === null, "no SEM → null");

console.log("ok");

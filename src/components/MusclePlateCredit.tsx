/** Attribution for muscles-anterior/posterior.png (see public/anatomy/SOURCES.md). */
export function MusclePlateCredit({ note }: { note?: string }) {
  return (
    <p className="mt-1.5 text-[10px] leading-4 text-slate">
      Hình nền (đã cắt):{" "}
      <a
        href="https://commons.wikimedia.org/wiki/File:Muscles_front_and_back.svg"
        target="_blank"
        rel="noreferrer"
        className="underline hover:text-cobalt"
      >
        OpenStax &amp; Tomáš Kebert &amp; umimeto.org, CC BY-SA 4.0
      </a>
      . Hình chỉ thể hiện lớp cơ nông. {note}
    </p>
  );
}

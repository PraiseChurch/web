import { TextSubsection } from ".";
import { VerseProps } from "../types";

export const Verse: React.FC<VerseProps> = ({ continuation, text, verse }) => {
  return (
    <TextSubsection title={verse}>
      &quot;{continuation ? "..." : ""}
      {text}&quot;
    </TextSubsection>
  );
};

import fs from "fs";
import path from "path";
import { Font } from "@react-pdf/renderer";

const fontsDir = path.join(process.cwd(), "public", "fonts", "bulletin");

// @react-pdf/renderer's Node-side font loader expects a string src. It can't
// fetch file:// URLs and its runtime calls .substring() on src, so we embed
// each font as a base64 data URL resolved at module load.
function src(file: string): string {
  const buffer = fs.readFileSync(path.join(fontsDir, file));
  return `data:font/otf;base64,${buffer.toString("base64")}`;
}

Font.register({
  family: "AlrightSans",
  fonts: [
    { src: src("AlrightSans-Regular.otf") },
    { src: src("AlrightSans-RegularItalic.otf"), fontStyle: "italic" },
    { src: src("AlrightSans-Bold.otf"), fontWeight: "bold" },
    {
      src: src("AlrightSans-BoldItalic.otf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "KlinicSlab",
  fonts: [
    { src: src("KlinicSlabBook.otf") },
    { src: src("KlinicSlabBookIt.otf"), fontStyle: "italic" },
    { src: src("KlinicSlabBold.otf"), fontWeight: "bold" },
    {
      src: src("KlinicSlabBoldIt.otf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

import { Font } from "@react-pdf/renderer";

// Browser registration — fetches OTF files from public/fonts/bulletin/.
// These paths resolve at runtime against the current origin.
const base = "/fonts/bulletin";

Font.register({
  family: "AlrightSans",
  fonts: [
    { src: `${base}/AlrightSans-Regular.otf` },
    { src: `${base}/AlrightSans-RegularItalic.otf`, fontStyle: "italic" },
    { src: `${base}/AlrightSans-Bold.otf`, fontWeight: "bold" },
    {
      src: `${base}/AlrightSans-BoldItalic.otf`,
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "KlinicSlab",
  fonts: [
    { src: `${base}/KlinicSlabBook.otf` },
    { src: `${base}/KlinicSlabBookIt.otf`, fontStyle: "italic" },
    { src: `${base}/KlinicSlabBold.otf`, fontWeight: "bold" },
    {
      src: `${base}/KlinicSlabBoldIt.otf`,
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  TabStopType,
  TabStopPosition,
} from "docx";
import { TRACE_OUTPUT_VERSION } from "next/dist/shared/lib/constants";

export default function WordDownloadPage() {
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    try {
      const stored = localStorage.getItem("tailoredResume");
      if (!stored) throw new Error("No resume data found.");
      const parsed = JSON.parse(stored);
      setResumeData(parsed);
      generateAndSetPdf(parsed); // ✅ Add this here
    } catch (err) {
      console.error("Error loading resume from localStorage:", err);
      setError("Failed to load resume. Redirecting...");
      setTimeout(() => router.push("/result"), 3000);
    }
  }, [status, router]);
  const generateDocx = () => {
    const sectionHeader = (text) => [
      new Paragraph({
        spacing: { before: 200, after: 0 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 8,
            color: "000000",
          },
        },
        children: [new TextRun({ text, bold: true, size: 24 })],
      }),
    ];

    const sections = [];

    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: resumeData.name, bold: true, size: 40 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    const contactParts = [];
    if (resumeData.contact?.location)
      contactParts.push(resumeData.contact.location);
    if (resumeData.contact?.email) contactParts.push(resumeData.contact.email);
    if (resumeData.contact?.website)
      contactParts.push(resumeData.contact.website);
    if (resumeData.contact?.phone) contactParts.push(resumeData.contact.phone);
    if (resumeData.contact?.github)
      contactParts.push(resumeData.contact.github);
    if (resumeData.contact?.linkedin)
      contactParts.push(resumeData.contact.linkedin);

    sections.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join(" | "), size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    sections.push(...sectionHeader("SUMMARY"));
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: resumeData.tailored_summary || "", size: 20 }),
        ],
      })
    );

    sections.push(...sectionHeader("EXPERIENCE"));
    (resumeData.tailored_experience || []).forEach((exp) => {
      sections.push(
        new Paragraph({
          tabStops: [
            { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
          ],
          children: [
            new TextRun({ text: exp.company, size: 20 }),
            new TextRun({
              text: `\t${exp.start} – ${exp.end}`,
              bold: true,
              size: 20,
            }),
          ],
        })
      );
      sections.push(
        new Paragraph({
          tabStops: [
            { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
          ],
          children: [
            new TextRun({ text: exp.title, size: 20 }),
            new TextRun({ text: `\t${exp.location}`, size: 20 }),
          ],
        })
      );
      exp.highlights.forEach((hl) =>
        sections.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: hl, size: 20 })],
          })
        )
      );
    });

    sections.push(...sectionHeader("TECHNICAL SKILLS"));
    Object.entries(resumeData.tailored_skills || {}).forEach(
      ([cat, skills]) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${cat}: `, bold: true, size: 20 }),
              new TextRun({ text: skills.join(", "), size: 20 }),
            ],
          })
        );
      }
    );

    sections.push(...sectionHeader("PROJECTS"));
    (resumeData.projects || []).forEach((proj) => {
      // one paragraph with a right-aligned tab stop
      sections.push(
        new Paragraph({
          tabStops: [
            { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
          ],
          children: [
            // left-side: project title
            new TextRun({
              text: proj.title,
              bold: true,
              size: 20,
            }),
            // insert a tab then show Tech: ... on the same line
            new TextRun({
              text:
                "\t" +
                (Array.isArray(proj.tech)
                  ? `Tech: ${proj.tech.join(", ")}`
                  : proj.tech || ""),
              size: 20,
            }),
          ],
        })
      );

      // then each bullet below it
      proj.highlights?.forEach((hl) =>
        sections.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: hl, size: 20 })],
          })
        )
      );
    });

    sections.push(...sectionHeader("EDUCATION"));
    const eduArray = Array.isArray(resumeData.education)
      ? resumeData.education
      : Object.values(resumeData.education || {});
    eduArray.forEach((edu) => {
      sections.push(
        new Paragraph({
          tabStops: [
            { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
          ],
          children: [
            new TextRun({ text: edu.program, italics: true, size: 20 }),
            new TextRun({
              text: `\t${edu.start} – ${edu.end}`,
              bold: true,
              size: 20,
            }),
          ],
        })
      );
      sections.push(
        new Paragraph({
          tabStops: [
            { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
          ],
          children: [
            new TextRun({ text: edu.school, bold: true, size: 20 }),
            new TextRun({ text: `\t${edu.location}`, italics: true, size: 20 }),
          ],
        })
      );
    });

    sections.push(...sectionHeader("CERTIFICATES"));
    (resumeData.tailored_certificates || []).forEach((cert) => {
      sections.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: cert, size: 20 })],
        })
      );
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 567, // 1 cm
                bottom: 567, // 1 cm
                left: 1078, // 1.9 cm
                right: 1078, // 1.9 cm
                gutter: 0,
              },
            },
          },
          children: sections,
        },
      ],
    });
    return doc;
  };
  const generateAndSetPdf = async (data) => {
    const CM_TO_PT = 28.35;
    const MARGIN_TOP = CM_TO_PT * 1;
    const MARGIN_BOTTOM = CM_TO_PT * 1;
    const MARGIN_LEFT = CM_TO_PT * 1.9;
    const MARGIN_RIGHT = CM_TO_PT * 1.9;
    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const usableWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
    const LINE_SPACING = 12;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN_TOP;
    const newPage = () => {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN_TOP;
    };

    const drawText = (text, opts = {}) => {
      const {
        size = 11,
        bold = false,
        italics = false,
        indent = 0,
        maxWidth = usableWidth,
        align = "left",
      } = opts;
      const textFont = italics ? italicFont : bold ? boldFont : font;
      const words = text.split(" ");
      let line = "";

      words.forEach((word, i) => {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = textFont.widthOfTextAtSize(testLine, size);

        if (testWidth > maxWidth) {
          if (y < MARGIN_BOTTOM + LINE_SPACING) newPage();
          const lineWidth = textFont.widthOfTextAtSize(line, size);
          const x0 =
            align === "center"
              ? MARGIN_LEFT + (usableWidth - lineWidth) / 2
              : MARGIN_LEFT + indent;
          page.drawText(line, {
            x: x0,
            y,
            size,
            font: textFont,
            color: rgb(0, 0, 0),
          });
          y -= LINE_SPACING;
          line = word;
        } else {
          line = testLine;
        }

        if (i === words.length - 1) {
          if (y < MARGIN_BOTTOM + LINE_SPACING) newPage();
          const lineWidth = textFont.widthOfTextAtSize(line, size);
          const x0 =
            align === "center"
              ? MARGIN_LEFT + (usableWidth - lineWidth) / 2
              : MARGIN_LEFT + indent;
          page.drawText(line, {
            x: x0,
            y,
            size,
            font: textFont,
            color: rgb(0, 0, 0),
          });
          y -= LINE_SPACING;
        }
      });
    };

    const sectionHeader = (title) => {
      y -= 4;
      if (y < MARGIN_BOTTOM + LINE_SPACING * 3) newPage();
      drawText(title, { size: 12, bold: true });
      page.drawLine({
        start: { x: MARGIN_LEFT, y: y + 4 },
        end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: y + 4 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      y -= 8;
    };

    drawText(data.name || "", { size: 16, bold: true, align: "center" });
    const contactLine = [
      data.contact?.location,
      data.contact?.email,
      data.contact?.website,
      data.contact?.phone,
      data.contact?.github,
      data.contact?.linkedin,
    ]
      .filter(Boolean)
      .join(" | ");
    drawText(contactLine, { size: 10, align: "center" });

    sectionHeader("SUMMARY");
    drawText(data.tailored_summary || "", { size: 11 });

    sectionHeader("EXPERIENCE");
    (data.tailored_experience || []).forEach((exp) => {
      drawText(`${exp.company} (${exp.start} – ${exp.end})`, {
        size: 11,
        bold: true,
      });
      drawText(`${exp.title} — ${exp.location}`, { size: 11, italics: true });
      exp.highlights.forEach((hl) =>
        drawText(`•     ${hl}`, { size: 10, indent: 15 })
      );
      y -= 4;
    });

    sectionHeader("TECHNICAL SKILLS");
    Object.entries(data.tailored_skills || {}).forEach(([cat, skills]) => {
      drawText(`${cat}: ${skills.join(", ")}`, { size: 11 });
    });

    sectionHeader("PROJECTS");
    (data.projects || []).forEach((proj) => {
      const techArray = Array.isArray(proj.tech)
        ? proj.tech
        : (proj.tech || "").split(",").map((t) => t.trim());

      drawText(proj.title + ` | Tech: ${techArray.join(", ")}`, {
        size: 11,
        bold: true,
      });

      proj.highlights?.forEach((hl) =>
        drawText(`•     ${hl}`, { size: 10, indent: 15 })
      );
      y -= 4;
    });
    sectionHeader("EDUCATION");
    const eduArray = Array.isArray(data.education)
      ? data.education
      : Object.values(data.education || {});
    eduArray.forEach((edu) => {
      drawText(`${edu.program} (${edu.start} – ${edu.end})`, {
        size: 11,
        bold: true,
      });
      drawText(`${edu.school} — ${edu.location}`, { size: 11, italics: true });
    });

    sectionHeader("CERTIFICATES");
    (data.tailored_certificates || []).forEach((cert) =>
      drawText(`•     ${cert}`, { size: 10, indent: 15 })
    );

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
  };

  const handleDownloadWord = async () => {
    if (!resumeData) return;
    setLoading(true);
    const doc = generateDocx();
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "tailored_resume.docx");
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    if (!resumeData) return;

    // ── Page & margin setup ──
    const CM_TO_PT = 28.35;
    const MARGIN_TOP = CM_TO_PT * 1; // 1 cm
    const MARGIN_BOTTOM = CM_TO_PT * 1; // 1 cm
    const MARGIN_LEFT = CM_TO_PT * 1.9; // 1.9 cm
    const MARGIN_RIGHT = CM_TO_PT * 1.9; // 1.9 cm
    const PAGE_WIDTH = 595.28; // A4 width in pt
    const PAGE_HEIGHT = 841.89; // A4 height in pt
    const usableWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
    const LINE_SPACING = 12; // 12pt

    // ── Create PDF ──
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN_TOP;

    const newPage = () => {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN_TOP;
    };

    // ── drawText helper ──
    const drawText = (text, opts = {}) => {
      const {
        size = 11,
        bold = false,
        italics = false,
        indent = 0,
        maxWidth = usableWidth,
        align = "left",
      } = opts;
      // choose font: italic > bold > regular
      const textFont = italics ? italicFont : bold ? boldFont : font;
      const words = text.split(" ");
      let line = "";

      words.forEach((word, i) => {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = textFont.widthOfTextAtSize(testLine, size);

        if (testWidth > maxWidth) {
          if (y < MARGIN_BOTTOM + LINE_SPACING) newPage();

          // calculate x for left or center
          const lineWidth = textFont.widthOfTextAtSize(line, size);
          const x0 =
            align === "center"
              ? MARGIN_LEFT + (usableWidth - lineWidth) / 2
              : MARGIN_LEFT + indent;

          page.drawText(line, {
            x: x0,
            y,
            size,
            font: textFont,
            color: rgb(0, 0, 0),
          });
          y -= LINE_SPACING;
          line = word;
        } else {
          line = testLine;
        }

        // on last word, draw remaining
        if (i === words.length - 1) {
          if (y < MARGIN_BOTTOM + LINE_SPACING) newPage();
          const lineWidth = textFont.widthOfTextAtSize(line, size);
          const x0 =
            align === "center"
              ? MARGIN_LEFT + (usableWidth - lineWidth) / 2
              : MARGIN_LEFT + indent;

          page.drawText(line, {
            x: x0,
            y,
            size,
            font: textFont,
            color: rgb(0, 0, 0),
          });
          y -= LINE_SPACING;
        }
      });
    };

    // ── Section header ──
    const sectionHeader = (title) => {
      y -= 4;
      if (y < MARGIN_BOTTOM + LINE_SPACING * 3) newPage();
      drawText(title, { size: 12, bold: true });
      page.drawLine({
        start: { x: MARGIN_LEFT, y: y + 4 },
        end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: y + 4 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      y -= 8;
    };

    // ── Draw content ──
    drawText(resumeData.name || "", { size: 16, bold: true, align: "center" });
    const contactLine = [
      resumeData.contact?.location,
      resumeData.contact?.email,
      resumeData.contact?.website,
      resumeData.contact?.phone,
      resumeData.contact?.github,
      resumeData.contact?.linkedin,
    ]
      .filter(Boolean)
      .join(" | ");
    drawText(contactLine, { size: 10, align: "center" });

    sectionHeader("SUMMARY");
    drawText(resumeData.tailored_summary || "", { size: 11 });

    sectionHeader("EXPERIENCE");
    (resumeData.tailored_experience || []).forEach((exp) => {
      drawText(`${exp.company} (${exp.start} – ${exp.end})`, {
        size: 11,
        bold: true,
      });
      drawText(`${exp.title} — ${exp.location}`, { size: 11, italics: true });
      exp.highlights.forEach((hl) =>
        drawText(`•     ${hl}`, { size: 10, indent: 15 })
      );
      y -= 4;
    });

    sectionHeader("TECHNICAL SKILLS");
    Object.entries(resumeData.tailored_skills || {}, { bold: true }).forEach(
      ([cat, skills]) => {
        drawText(`${cat}: ${skills.join(", ")}`, { size: 11 });
      }
    );

    sectionHeader("PROJECTS");
    (resumeData.projects || []).forEach((proj) => {
      const techArray = Array.isArray(proj.tech)
        ? proj.tech
        : (proj.tech || "").split(",").map((t) => t.trim());

      drawText(proj.title + ` | Tech: ${techArray.join(", ")}`, {
        size: 11,
        bold: true,
      });

      proj.highlights?.forEach((hl) =>
        drawText(`•     ${hl}`, { size: 10, indent: 15 })
      );
      y -= 4;
    });

    sectionHeader("EDUCATION");
    const eduArray = Array.isArray(resumeData.education)
      ? resumeData.education
      : Object.values(resumeData.education || {});
    eduArray.forEach((edu) => {
      drawText(`${edu.program} (${edu.start} – ${edu.end})`, {
        size: 11,
        bold: true,
      });
      drawText(`${edu.school} — ${edu.location}`, { size: 11, italics: true });
    });

    sectionHeader("CERTIFICATES");
    (resumeData.tailored_certificates || []).forEach((cert) =>
      drawText(`•     ${cert}`, { size: 10, indent: 15 })
    );

    // ── Save & preview ──
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    saveAs(blob, "tailored_resume.pdf");
  };

  if (!resumeData && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-600">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-purple-100 via-blue-50 to-pink-100 p-6">
      <div className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-2xl text-center border border-gray-200">
        <h1 className="text-3xl font-extrabold mb-4 text-purple-700">
          🎉 Your Resume is Ready!
        </h1>
        <p className="text-gray-600 mb-6">
          Click below to download your AI-tailored resume.
        </p>

        {error && <p className="text-red-500 font-medium">{error}</p>}

        <div className="space-y-4">
          <button
            onClick={handleDownloadWord}
            disabled={loading}
            className={`w-full ${
              loading
                ? "bg-purple-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300`}
          >
            {loading ? "Preparing Word..." : "⬇️ Download Word Document"}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={loading}
            className={`w-full ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300`}
          >
            {loading ? "Generating PDF..." : "⬇️ Download PDF Document"}
          </button>

          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="PDF Preview"
              className="w-full h-96 border rounded-xl mt-4"
            />
          )}
        </div>
      </div>
    </div>
  );
}

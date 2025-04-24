"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { saveAs } from "file-saver";
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

export default function WordDownloadPage() {
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    } catch (err) {
      console.error("Error loading resume from localStorage:", err);
      setError("Failed to load resume. Redirecting...");
      setTimeout(() => router.push("/result"), 3000);
    }
  }, [status, router]);

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

  const handleDownload = async () => {
    if (!resumeData) return;
    setLoading(true);

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
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.title, bold: true, size: 20 }),
            new TextRun({
              text: proj.tech?.length ? `   Tech: ${proj.tech.join(", ")}` : "",
              size: 20,
            }),
          ],
        })
      );
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
    if (eduArray.length === 0) {
      sections.push(new Paragraph("No education data available."));
    } else {
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
              new TextRun({
                text: `\t${edu.location}`,
                italics: true,
                size: 20,
              }),
            ],
          })
        );
      });
    }

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
                top: 567,
                bottom: 567,
                left: 1078,
                right: 1078,
                gutter: 0,
              },
            },
          },
          children: sections,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "tailored_resume.docx");
    setLoading(false);
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
          Click below to download your AI-tailored resume as a Word document.
        </p>
        {error ? (
          <p className="text-red-500 font-medium">{error}</p>
        ) : (
          <button
            onClick={handleDownload}
            disabled={loading}
            className={`${
              loading
                ? "bg-purple-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300`}
          >
            {loading ? "Preparing..." : "⬇️ Download Word Document"}
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";

export default function WordDownloadPage() {
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
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
  }, [router]);

  const sectionHeader = (text) => [
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text, bold: true, size: 28 })],
    }),
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
      },
    }),
  ];

  const handleDownload = async () => {
    if (!resumeData) return;

    const sections = [];

    // Name
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.name,
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );

    // Contact Info
    const contactInfo = [
      resumeData.contact?.location,
      resumeData.contact?.email,
      resumeData.contact?.website,
      resumeData.contact?.phone,
      resumeData.contact?.github,
      resumeData.contact?.linkedin,
    ]
      .filter(Boolean)
      .join(" | ");

    sections.push(
      new Paragraph({
        children: [new TextRun({ text: contactInfo })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    // Summary
    sections.push(...sectionHeader("SUMMARY"));
    sections.push(
      new Paragraph({
        children: [new TextRun(resumeData.tailored_summary || "")],
        spacing: { after: 200 },
      })
    );

    // Experience
    sections.push(...sectionHeader("EXPERIENCE"));
    (resumeData.tailored_experience || []).forEach((exp) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}     ${exp.start} – ${exp.end}`,
              bold: true,
            }),
          ],
        })
      );
      sections.push(
        new Paragraph({
          children: [new TextRun(`${exp.title}     ${exp.location}`)],
        })
      );
      exp.highlights.forEach((hl) =>
        sections.push(
          new Paragraph({
            text: `• ${hl}`,
            spacing: { after: 100 },
          })
        )
      );
    });

    // Technical Skills
    sections.push(...sectionHeader("TECHNICAL SKILLS"));
    Object.entries(resumeData.tailored_skills || {}).forEach(
      ([cat, skills]) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${cat}: `, bold: true }),
              new TextRun(skills.join(", ")),
            ],
          })
        );
      }
    );

    // Projects
    sections.push(...sectionHeader("PROJECTS"));
    (resumeData.projects || []).forEach((proj) => {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: proj.title, bold: true })],
        })
      );
      if (proj.tech?.length) {
        sections.push(new Paragraph(`Tech: ${proj.tech.join(", ")}`));
      }
      sections.push(new Paragraph(proj.description));
    });

    // Education
    sections.push(...sectionHeader("EDUCATION"));
    const eduArray = Array.isArray(resumeData.education)
      ? resumeData.education
      : Object.values(resumeData.education || {});
    if (eduArray.length === 0) {
      sections.push(new Paragraph("No education data available."));
    } else {
      eduArray.forEach((edu) => {
        sections.push(
          new Paragraph(`${edu.program}     ${edu.start} – ${edu.end}`)
        );
        sections.push(new Paragraph(`${edu.school}     ${edu.location}`));
      });
    }

    // Certificates
    sections.push(...sectionHeader("CERTIFICATES"));
    (resumeData.tailored_certificates || []).forEach((cert) => {
      sections.push(new Paragraph(`• ${cert}`));
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 inch
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
          children: sections,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "tailored_resume.docx");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-2xl text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Download Your Tailored Resume
        </h1>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <button
            onClick={handleDownload}
            className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition"
          >
            Download Word Document
          </button>
        )}
      </div>
    </div>
  );
}

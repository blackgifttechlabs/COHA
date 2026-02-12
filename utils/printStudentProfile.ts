import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Student } from '../types';

const fetchImage = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Failed to load image for PDF", error);
    return "";
  }
};

export const printStudentProfile = async (student: Student) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // --- Header ---
  const logoUrl = "https://i.ibb.co/LzYXwYfX/logo.png";
  const logoData = await fetchImage(logoUrl);
  if (logoData) {
      doc.addImage(logoData, 'PNG', 14, 10, 25, 25);
  }

  doc.setFontSize(16);
  doc.setTextColor(0, 29, 100); // COHA Blue
  doc.setFont("helvetica", "bold");
  doc.text("CIRCLE OF HOPE ACADEMY", 45, 20);
  
  doc.setFontSize(9);
  doc.setTextColor(0, 152, 241); // Light Blue
  doc.text("ACCESSIBLE EDUCATION FOR ALL", 45, 25);
  
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.text("P.O. Box 3675 Ondangwa", pageWidth - 14, 18, { align: "right" });
  doc.text("Cell: +264 81 666 4074", pageWidth - 14, 22, { align: "right" });
  doc.text("circleofhopeacademy@yahoo.com", pageWidth - 14, 26, { align: "right" });

  // Divider
  doc.setDrawColor(0, 29, 100);
  doc.setLineWidth(0.5);
  doc.line(14, 38, pageWidth - 14, 38);

  // --- Student Summary ---
  doc.setFillColor(245, 247, 250);
  doc.rect(14, 42, pageWidth - 28, 20, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(student.name.toUpperCase(), 18, 51);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Grade: ${student.grade || '-'}   |   Student ID: ${student.id.substring(0, 8)}   |   Enrolled: ${student.enrolledAt?.toDate ? student.enrolledAt.toDate().toLocaleDateString() : 'N/A'}`, 18, 57);

  let currentY = 66;

  // --- Common Table Styles ---
  const tableStyles: any = {
      theme: 'grid',
      headStyles: { fillColor: [0, 29, 100], fontSize: 8, fontStyle: 'bold', textColor: 255 },
      bodyStyles: { fontSize: 8, textColor: 50, cellPadding: 1.5 },
      columnStyles: { 0: { fontStyle: 'bold', width: 45, fillColor: [250, 250, 250] } },
      margin: { left: 14, right: 14 }
  };

  // --- Left Column Tables (Learner & Emergency) ---
  // We use the startY of the previous table to place the next one.
  // Since we want columns, we need to manipulate margins/widths or use startY carefully.
  // To ensure it fits on one page, we will stack them cleanly as full width tables but compact.

  // Table 1: Learner Info
  autoTable(doc, {
      startY: currentY,
      head: [[{ content: 'LEARNER INFORMATION', colSpan: 4, styles: { halign: 'left' } }]],
      body: [
          ['Full Name', student.name || '-', 'Date of Birth', student.dob || '-'],
          ['Gender', student.gender || '-', 'Citizenship', student.citizenship || '-'],
          ['Address', { content: student.address || '-', colSpan: 3 }],
          ['Special Needs', student.isSpecialNeeds ? `Yes (${student.specialNeedsType || '-'})` : 'No', 'Parent PIN', student.parentPin || '****']
      ],
      ...tableStyles,
      columnStyles: { 
          0: { fontStyle: 'bold', width: 30, fillColor: [248, 248, 248] },
          1: { width: 60 },
          2: { fontStyle: 'bold', width: 30, fillColor: [248, 248, 248] }
      }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Table 2: Parents
  autoTable(doc, {
      startY: currentY,
      head: [[{ content: 'PARENT / GUARDIAN DETAILS', colSpan: 4, styles: { halign: 'left' } }]],
      body: [
          ['Father Name', student.fatherName || '-', 'Father Phone', student.fatherPhone || '-'],
          ['Father Email', { content: student.fatherEmail || '-', colSpan: 3 }],
          ['Mother Name', student.motherName || '-', 'Mother Phone', student.motherPhone || '-']
      ],
      ...tableStyles,
      columnStyles: { 
          0: { fontStyle: 'bold', width: 30, fillColor: [248, 248, 248] },
          1: { width: 60 },
          2: { fontStyle: 'bold', width: 30, fillColor: [248, 248, 248] }
      }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Table 3: Emergency & Medical
  autoTable(doc, {
      startY: currentY,
      head: [[{ content: 'EMERGENCY & MEDICAL', colSpan: 4, styles: { halign: 'left' } }]],
      body: [
          ['Emergency Contact', student.emergencyName || '-', 'Relation', student.emergencyRelationship || '-'],
          ['Emergency Number', student.emergencyCell || '-', 'Work Contact', student.emergencyWork || '-'],
          ['Medical Conditions', { content: student.medicalConditions || 'None', colSpan: 3 }],
          ['Doctor', student.doctorName || '-', 'Medical Aid', student.hasMedicalAid ? (student.medicalAidName || '-') : 'None'],
          ['Medical Consent', { content: student.medicalConsent ? 'Consent GIVEN for emergency treatment' : 'Consent NOT GIVEN', colSpan: 3, styles: { textColor: student.medicalConsent ? [0, 100, 0] : [200, 0, 0], fontStyle: 'bold' } }]
      ],
      ...tableStyles,
      columnStyles: { 
          0: { fontStyle: 'bold', width: 30, fillColor: [248, 248, 248] },
          1: { width: 60 },
          2: { fontStyle: 'bold', width: 30, fillColor: [248, 248, 248] }
      }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

   // Table 4: History
   autoTable(doc, {
    startY: currentY,
    head: [[{ content: 'ACADEMIC HISTORY', colSpan: 2, styles: { halign: 'left' } }]],
    body: [
        ['Previous School', student.previousSchool || 'None'],
        ['Highest Grade', student.highestGrade || 'N/A'],
        ['English Proficiency', student.langEnglish || '-'],
        ['Other Languages', student.langOther1Name ? `${student.langOther1Name} (${student.langOther1Rating || '-'})` : '-']
    ],
    ...tableStyles,
    columnStyles: { 
        0: { fontStyle: 'bold', width: 40, fillColor: [248, 248, 248] }
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 285);
  doc.text("Page 1 of 1", pageWidth - 14, 285, { align: "right" });

  doc.save(`${student.surname || 'Student'}_${student.firstName || 'Profile'}_Profile.pdf`);
};
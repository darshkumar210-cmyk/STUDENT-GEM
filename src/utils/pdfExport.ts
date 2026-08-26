import { jsPDF } from 'jspdf';
import { YouTubeStudyNotes, CheatSheetData, FlashcardDeck } from '../types';

/**
 * Helper to clean text strings from markdown asterisks, bold markers, or raw symbols
 */
function cleanMarkdownText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .trim();
}

/**
 * Export YouTube Study Notes as a multi-page, formatted PDF using jsPDF
 */
export function exportNotesToPDF(notes: YouTubeStudyNotes, isPro: boolean = false): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 16;
  const marginTop = 20;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginX * 2; // 178mm

  let currentY = marginTop;

  // Helper to ensure new pages have proper header/footer spacing
  const checkAddPage = (requiredSpace: number) => {
    if (currentY + requiredSpace > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
      drawRunningHeader();
    }
  };

  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('STUDYGEM • AI ACADEMIC NOTES', marginX, 12);

    doc.setFont('helvetica', 'normal');
    doc.text(
      `${notes.subject || 'Lecture'} • ${notes.difficulty || 'All Levels'}`,
      pageWidth - marginX,
      12,
      { align: 'right' }
    );

    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.3);
    doc.line(marginX, 14, pageWidth - marginX, 14);
  };

  // --- 1. COVER / HEADER SECTION ---
  // Accent Tag
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.roundedRect(marginX, currentY, 32, 6, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('STUDY GUIDE', marginX + 16, currentY + 4.2, { align: 'center' });

  // Subject Pill
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.roundedRect(marginX + 35, currentY, 38, 6, 1.5, 1.5, 'F');
  doc.setTextColor(51, 65, 85);
  doc.text((notes.subject || 'Academic').toUpperCase(), marginX + 54, currentY + 4.2, { align: 'center' });

  currentY += 12;

  // Note Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate-900
  const titleLines = doc.splitTextToSize(notes.title || 'Lecture Study Notes', contentWidth);
  doc.text(titleLines, marginX, currentY);
  currentY += titleLines.length * 7 + 3;

  // Metadata line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const metadataText = `Level: ${notes.difficulty || 'Comprehensive'} | Est. Read Time: ${
    notes.estimatedReadTime || '15 min'
  } | Generated: ${new Date().toLocaleDateString()}`;
  doc.text(metadataText, marginX, currentY);
  currentY += 6;

  // Divider
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 8;

  // --- 2. EXECUTIVE SUMMARY & TAKEAWAYS ---
  if (notes.executiveSummary) {
    checkAddPage(35);
    // Section header
    doc.setFillColor(238, 242, 255); // Indigo-50
    doc.rect(marginX, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(67, 56, 202); // Indigo-700
    doc.text('EXECUTIVE SUMMARY & CORE INSIGHT', marginX + 3, currentY + 5);
    currentY += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59); // Slate-800
    const summaryLines = doc.splitTextToSize(cleanMarkdownText(notes.executiveSummary), contentWidth - 4);
    doc.text(summaryLines, marginX + 2, currentY);
    currentY += summaryLines.length * 5 + 6;
  }

  // Key Takeaways
  if (notes.keyTakeaways && notes.keyTakeaways.length > 0) {
    checkAddPage(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Key High-Yield Takeaways:', marginX, currentY);
    currentY += 5;

    notes.keyTakeaways.forEach((point) => {
      const cleanPoint = cleanMarkdownText(point);
      const pointLines = doc.splitTextToSize(`• ${cleanPoint}`, contentWidth - 6);
      checkAddPage(pointLines.length * 4.5 + 2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(pointLines, marginX + 3, currentY);
      currentY += pointLines.length * 4.5 + 2;
    });
    currentY += 4;
  }

  // --- 3. CORNELL DETAILED NOTES ---
  if (notes.cornellNotes) {
    checkAddPage(30);

    // Section Header
    doc.setFillColor(15, 23, 42); // Black / Dark Slate
    doc.rect(marginX, currentY, contentWidth, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(255, 255, 255);
    doc.text('CORNELL LECTURE SYNTHESIS & DETAILED NOTES', marginX + 4, currentY + 5.2);
    currentY += 12;

    // Cues and Review Questions Column / Box if available
    if (notes.cornellNotes.cuesAndQuestions && notes.cornellNotes.cuesAndQuestions.length > 0) {
      checkAddPage(25);
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.setDrawColor(203, 213, 225); // Slate-300
      doc.setLineWidth(0.3);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(79, 70, 229);
      doc.text('Study Cues & Active Recall Questions:', marginX, currentY);
      currentY += 5;

      notes.cornellNotes.cuesAndQuestions.forEach((cue, i) => {
        const cueLines = doc.splitTextToSize(`[Q${i + 1}] ${cleanMarkdownText(cue)}`, contentWidth - 6);
        checkAddPage(cueLines.length * 4.5 + 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(cueLines, marginX + 3, currentY);
        currentY += cueLines.length * 4.5 + 2;
      });
      currentY += 4;
    }

    // Detailed notes body
    if (notes.cornellNotes.detailedNotes) {
      checkAddPage(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Comprehensive Content Breakdown:', marginX, currentY);
      currentY += 6;

      const paragraphs = notes.cornellNotes.detailedNotes.split('\n');
      paragraphs.forEach((para) => {
        const trimmed = para.trim();
        if (!trimmed) {
          currentY += 2;
          return;
        }

        const isHeading = trimmed.startsWith('#');
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const cleaned = cleanMarkdownText(trimmed);

        if (isHeading) {
          checkAddPage(12);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(79, 70, 229);
          const lines = doc.splitTextToSize(cleaned, contentWidth);
          doc.text(lines, marginX, currentY);
          currentY += lines.length * 5 + 2;
        } else if (isBullet) {
          const lines = doc.splitTextToSize(`•  ${cleaned}`, contentWidth - 4);
          checkAddPage(lines.length * 4.5 + 1.5);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(lines, marginX + 2, currentY);
          currentY += lines.length * 4.5 + 1.5;
        } else {
          const lines = doc.splitTextToSize(cleaned, contentWidth);
          checkAddPage(lines.length * 4.5 + 2);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(lines, marginX, currentY);
          currentY += lines.length * 4.5 + 2.5;
        }
      });
      currentY += 4;
    }

    // Bottom Summary Box
    if (notes.cornellNotes.bottomSummary) {
      const summaryText = cleanMarkdownText(notes.cornellNotes.bottomSummary);
      const lines = doc.splitTextToSize(summaryText, contentWidth - 8);
      const boxHeight = lines.length * 4.5 + 12;

      checkAddPage(boxHeight + 6);
      doc.setFillColor(243, 244, 246);
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.8);
      doc.roundedRect(marginX, currentY, contentWidth, boxHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(79, 70, 229);
      doc.text('CHAPTER SUMMARY / CORNELL CONCLUSION', marginX + 4, currentY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(31, 41, 55);
      doc.text(lines, marginX + 4, currentY + 10.5);

      currentY += boxHeight + 8;
    }
  }

  // --- 4. KEY VOCABULARY & DEFINITIONS ---
  if (notes.keyDefinitions && notes.keyDefinitions.length > 0) {
    checkAddPage(30);
    doc.setFillColor(238, 242, 255);
    doc.rect(marginX, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(67, 56, 202);
    doc.text('KEY DEFINITIONS & HIGH-YIELD VOCABULARY', marginX + 3, currentY + 5);
    currentY += 10;

    notes.keyDefinitions.forEach((def, i) => {
      const term = cleanMarkdownText(def.term);
      const definition = cleanMarkdownText(def.definition);
      const mnemonic = def.exampleOrMnemonic ? cleanMarkdownText(def.exampleOrMnemonic) : '';

      const defLines = doc.splitTextToSize(`Definition: ${definition}`, contentWidth - 6);
      const mnemLines = mnemonic ? doc.splitTextToSize(`Note / Mnemonic: ${mnemonic}`, contentWidth - 6) : [];
      const itemHeight = 6 + defLines.length * 4.2 + (mnemLines.length ? mnemLines.length * 4 + 2 : 0) + 3;

      checkAddPage(itemHeight);

      // Term
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${i + 1}. ${term}`, marginX + 2, currentY);
      currentY += 4.5;

      // Definition
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(defLines, marginX + 4, currentY);
      currentY += defLines.length * 4.2;

      // Mnemonic if any
      if (mnemLines.length) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(mnemLines, marginX + 4, currentY);
        currentY += mnemLines.length * 4;
      }

      currentY += 3;
    });
    currentY += 4;
  }

  // --- 5. ACTIVE RECALL FLASHCARDS ---
  if (notes.flashcards && notes.flashcards.length > 0) {
    checkAddPage(30);
    doc.setFillColor(15, 23, 42);
    doc.rect(marginX, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`ACTIVE-RECALL FLASHCARDS (${notes.flashcards.length} CARDS)`, marginX + 3, currentY + 5);
    currentY += 10;

    notes.flashcards.forEach((card, idx) => {
      const front = cleanMarkdownText(card.front);
      const back = cleanMarkdownText(card.back);

      const frontLines = doc.splitTextToSize(`Q: ${front}`, contentWidth - 8);
      const backLines = doc.splitTextToSize(`A: ${back}`, contentWidth - 8);
      const cardHeight = frontLines.length * 4.2 + backLines.length * 4.2 + 8;

      checkAddPage(cardHeight + 3);

      // Card Container
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(marginX, currentY, contentWidth, cardHeight, 1.5, 1.5, 'FD');

      // Question
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(67, 56, 202); // Indigo
      doc.text(frontLines, marginX + 3, currentY + 4.5);

      // Answer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(backLines, marginX + 3, currentY + 4.5 + frontLines.length * 4.2 + 1);

      currentY += cardHeight + 3;
    });
    currentY += 4;
  }

  // --- 6. PRACTICE QUIZ WITH ANSWER EXPLANATIONS ---
  if (notes.quiz && notes.quiz.length > 0) {
    checkAddPage(30);
    doc.setFillColor(238, 242, 255);
    doc.rect(marginX, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(67, 56, 202);
    doc.text(`PRACTICE EXAM QUIZ (${notes.quiz.length} QUESTIONS)`, marginX + 3, currentY + 5);
    currentY += 10;

    notes.quiz.forEach((q, qIndex) => {
      const qText = cleanMarkdownText(q.question);
      const qLines = doc.splitTextToSize(`${qIndex + 1}. ${qText}`, contentWidth - 4);
      let neededSpace = qLines.length * 4.5 + 4;
      q.options.forEach((opt) => {
        const optLines = doc.splitTextToSize(`[  ] ${cleanMarkdownText(opt)}`, contentWidth - 8);
        neededSpace += optLines.length * 4 + 1;
      });
      neededSpace += 10; // for explanation space

      checkAddPage(neededSpace);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(qLines, marginX + 2, currentY);
      currentY += qLines.length * 4.5 + 1.5;

      const letters = ['A', 'B', 'C', 'D', 'E'];
      q.options.forEach((opt, optIdx) => {
        const isCorrect = optIdx === q.correctIndex;
        const optLines = doc.splitTextToSize(
          `(${letters[optIdx] || optIdx + 1}) ${cleanMarkdownText(opt)}`,
          contentWidth - 8
        );
        doc.setFont('helvetica', isCorrect ? 'bold' : 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(isCorrect ? 16 : 71, isCorrect ? 185 : 85, isCorrect ? 129 : 105);
        doc.text(optLines, marginX + 5, currentY);
        currentY += optLines.length * 4 + 1;
      });

      // Explanation
      if (q.explanation) {
        const explText = `Answer: (${letters[q.correctIndex]}) • Explanation: ${cleanMarkdownText(q.explanation)}`;
        const explLines = doc.splitTextToSize(explText, contentWidth - 8);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(explLines, marginX + 5, currentY + 1);
        currentY += explLines.length * 3.8 + 4;
      } else {
        currentY += 3;
      }
    });
    currentY += 4;
  }

  // --- 7. ACTIONABLE STUDY CHECKLIST ---
  if (notes.actionChecklist && notes.actionChecklist.length > 0) {
    checkAddPage(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Actionable Study Checklist:', marginX, currentY);
    currentY += 5;

    notes.actionChecklist.forEach((task) => {
      const taskLines = doc.splitTextToSize(`[  ] ${cleanMarkdownText(task)}`, contentWidth - 4);
      checkAddPage(taskLines.length * 4.5 + 2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(taskLines, marginX + 3, currentY);
      currentY += taskLines.length * 4.5 + 1.5;
    });
    currentY += 4;
  }

  // --- FOOTERS & PAGE NUMBERS ACROSS ALL PAGES ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400

    // Footer divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    const branding = isPro
      ? 'StudyGem Pro • Confidential Student Notes'
      : 'Generated with StudyGem.ai — Free Academic Study Suite';
    doc.text(branding, marginX, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  }

  // Generate clean filename and save
  const sanitizedTitle = (notes.title || 'StudyGem_Notes')
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .slice(0, 40);
  doc.save(`${sanitizedTitle}_study_notes.pdf`);
}

/**
 * Export Exam Cheat Sheet to PDF
 */
export function exportCheatSheetToPDF(cheatSheet: CheatSheetData, isPro: boolean = false): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const marginTop = 20;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginX * 2;

  let currentY = marginTop;

  const checkAddPage = (requiredSpace: number) => {
    if (currentY + requiredSpace > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
      drawRunningHeader();
    }
  };

  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('STUDYGEM • HIGH-YIELD FORMULA CHEAT SHEET', marginX, 12);
    doc.setFont('helvetica', 'normal');
    doc.text(cheatSheet.subject || 'STEM / Exam Review', pageWidth - marginX, 12, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, 14, pageWidth - marginX, 14);
  };

  // Header Title
  doc.setFillColor(234, 88, 12); // Orange-600
  doc.roundedRect(marginX, currentY, 36, 6, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('EXAM CHEAT SHEET', marginX + 18, currentY + 4.2, { align: 'center' });
  currentY += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(cheatSheet.title || 'Exam Formula Sheet', contentWidth);
  doc.text(titleLines, marginX, currentY);
  currentY += titleLines.length * 7 + 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Subject: ${cheatSheet.subject} | Date: ${new Date().toLocaleDateString()}`, marginX, currentY);
  currentY += 6;

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 8;

  // Sections
  cheatSheet.sections.forEach((sec) => {
    checkAddPage(25);
    doc.setFillColor(255, 247, 237); // Orange-50
    doc.rect(marginX, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(194, 65, 12); // Orange-700
    doc.text(sec.sectionName.toUpperCase(), marginX + 3, currentY + 5);
    currentY += 10;

    sec.items.forEach((item) => {
      const formulaLines = doc.splitTextToSize(`Formula: ${item.formula}`, contentWidth - 8);
      const varLines = item.variables ? doc.splitTextToSize(`Variables: ${item.variables}`, contentWidth - 8) : [];
      const useLines = item.whenToUse ? doc.splitTextToSize(`When to Use: ${item.whenToUse}`, contentWidth - 8) : [];
      const itemHeight = 6 + formulaLines.length * 4.2 + (varLines.length ? varLines.length * 4 : 0) + (useLines.length ? useLines.length * 4 : 0) + 4;

      checkAddPage(itemHeight);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${item.name}`, marginX + 2, currentY);
      currentY += 4.5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(67, 56, 202);
      doc.text(formulaLines, marginX + 5, currentY);
      currentY += formulaLines.length * 4.2;

      if (varLines.length) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(varLines, marginX + 5, currentY);
        currentY += varLines.length * 4;
      }

      if (useLines.length) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(useLines, marginX + 5, currentY);
        currentY += useLines.length * 4;
      }

      currentY += 3;
    });
    currentY += 4;
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);
    doc.text(isPro ? 'StudyGem Pro • Formula Sheet' : 'Generated with StudyGem.ai', marginX, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  }

  const sanitized = (cheatSheet.title || 'Cheat_Sheet').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${sanitized}_cheatsheet.pdf`);
}

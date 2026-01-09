import React, { useState } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '../utils/format';
import useStore from '../store/useStore';

const PDFReportGenerator = ({ simulation }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('full');
  const { unlockedAchievements } = useStore();

  const generatePDF = async () => {
    if (!simulation?.baseline?.members) return;

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;

      // Helper functions
      const addHeader = (text, y, size = 20) => {
        doc.setFontSize(size);
        doc.setTextColor(34, 197, 94); // Green color
        doc.text(text, margin, y);
        return y + 10;
      };

      const addSubheader = (text, y, size = 14) => {
        doc.setFontSize(size);
        doc.setTextColor(100, 100, 100);
        doc.text(text, margin, y);
        return y + 8;
      };

      const addText = (text, y, size = 11) => {
        doc.setFontSize(size);
        doc.setTextColor(50, 50, 50);
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        doc.text(lines, margin, y);
        return y + (lines.length * 5) + 5;
      };

      const addDivider = (y) => {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        return y + 10;
      };

      let y = margin;

      // ==================== COVER PAGE ====================
      // Background gradient effect (simulated with rectangles)
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Title
      doc.setFontSize(36);
      doc.setTextColor(34, 197, 94);
      doc.text('SEEDLING', pageWidth / 2, 60, { align: 'center' });

      doc.setFontSize(14);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Generational Wealth Report', pageWidth / 2, 75, { align: 'center' });

      // Tree emoji as text
      doc.setFontSize(60);
      doc.text('🌳', pageWidth / 2, 120, { align: 'center' });

      // Report date
      doc.setFontSize(12);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, pageWidth / 2, 160, { align: 'center' });

      // Family info
      const totalWealth = simulation.baseline.members.reduce((sum, m) => sum + m.netWorth, 0);
      const totalMembers = simulation.baseline.members.length;
      const generations = Math.max(...simulation.baseline.members.map(m => m.generation)) + 1;

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(`Total Family Wealth: ${formatCurrency(totalWealth)}`, pageWidth / 2, 190, { align: 'center' });
      doc.text(`${totalMembers} Family Members across ${generations} Generations`, pageWidth / 2, 205, { align: 'center' });

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Your legacy starts with a single seed 🌱', pageWidth / 2, pageHeight - 20, { align: 'center' });

      // ==================== PAGE 2: EXECUTIVE SUMMARY ====================
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      y = margin;
      y = addHeader('Executive Summary', y, 24);
      y = addDivider(y);

      // Key metrics boxes
      const metrics = [
        { label: 'Total Family Wealth', value: formatCurrency(totalWealth), icon: '💰' },
        { label: 'Family Members', value: totalMembers.toString(), icon: '👨‍👩‍👧‍👦' },
        { label: 'Generations', value: generations.toString(), icon: '🌳' },
        { label: 'Avg Net Worth', value: formatCurrency(totalWealth / totalMembers), icon: '📊' },
      ];

      const boxWidth = (pageWidth - 2 * margin - 30) / 2;
      const boxHeight = 30;

      metrics.forEach((metric, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = margin + col * (boxWidth + 10);
        const boxY = y + row * (boxHeight + 10);

        doc.setFillColor(240, 253, 244); // green-50
        doc.roundedRect(x, boxY, boxWidth, boxHeight, 3, 3, 'F');

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(metric.label, x + 5, boxY + 10);

        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94);
        doc.text(metric.value, x + 5, boxY + 22);
      });

      y += 90;

      // Financial Health Distribution
      y = addSubheader('Financial Health Distribution', y);

      const healthCounts = {
        thriving: simulation.baseline.members.filter(m => m.financialHealth === 'thriving').length,
        growing: simulation.baseline.members.filter(m => m.financialHealth === 'growing').length,
        stable: simulation.baseline.members.filter(m => m.financialHealth === 'stable').length,
        distressed: simulation.baseline.members.filter(m => m.financialHealth === 'distressed').length,
      };

      Object.entries(healthCounts).forEach(([health, count], idx) => {
        const barWidth = (count / totalMembers) * (pageWidth - 2 * margin - 80);
        const colors = {
          thriving: [34, 197, 94],
          growing: [74, 222, 128],
          stable: [59, 130, 246],
          distressed: [239, 68, 68],
        };

        doc.setFillColor(...colors[health]);
        doc.roundedRect(margin + 70, y + idx * 12, barWidth, 8, 2, 2, 'F');

        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text(health.charAt(0).toUpperCase() + health.slice(1), margin, y + idx * 12 + 6);
        doc.text(`${count} (${((count / totalMembers) * 100).toFixed(0)}%)`, margin + 75 + barWidth, y + idx * 12 + 6);
      });

      y += 60;

      // Key Insights
      y = addSubheader('Key Insights', y);

      const insights = [
        `Your family's total wealth of ${formatCurrency(totalWealth)} spans ${generations} generations.`,
        `${healthCounts.thriving} members (${((healthCounts.thriving / totalMembers) * 100).toFixed(0)}%) are thriving financially.`,
        `The average net worth per family member is ${formatCurrency(totalWealth / totalMembers)}.`,
        `${simulation.baseline.members.filter(m => m.ownsHome).length} family members are homeowners.`,
      ];

      insights.forEach((insight, idx) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 15, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text(`• ${insight}`, margin + 5, y + 10);
        y += 18;
      });

      // ==================== PAGE 3: FAMILY MEMBERS TABLE ====================
      doc.addPage();
      y = margin;
      y = addHeader('Family Members Detail', y, 20);
      y = addDivider(y);

      // Create table data
      const tableData = simulation.baseline.members.map(member => [
        member.name,
        `Gen ${member.generation + 1}`,
        member.currentAge,
        formatCurrency(member.netWorth),
        member.financialHealth.charAt(0).toUpperCase() + member.financialHealth.slice(1),
        member.ownsHome ? 'Yes' : 'No',
      ]);

      doc.autoTable({
        startY: y,
        head: [['Name', 'Generation', 'Age', 'Net Worth', 'Health', 'Homeowner']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 253, 244],
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 40 },
          3: { halign: 'right' },
          5: { halign: 'center' },
        },
      });

      y = doc.lastAutoTable.finalY + 15;

      // ==================== PAGE 4: WEALTH BY GENERATION ====================
      if (y > pageHeight - 100) {
        doc.addPage();
        y = margin;
      }

      y = addHeader('Wealth by Generation', y, 18);

      // Group by generation
      const genWealth = {};
      simulation.baseline.members.forEach(m => {
        if (!genWealth[m.generation]) {
          genWealth[m.generation] = { total: 0, count: 0, members: [] };
        }
        genWealth[m.generation].total += m.netWorth;
        genWealth[m.generation].count++;
        genWealth[m.generation].members.push(m.name);
      });

      const genTableData = Object.entries(genWealth).map(([gen, data]) => [
        `Generation ${parseInt(gen) + 1}`,
        data.count,
        formatCurrency(data.total),
        formatCurrency(data.total / data.count),
        data.members.slice(0, 3).join(', ') + (data.members.length > 3 ? '...' : ''),
      ]);

      doc.autoTable({
        startY: y + 5,
        head: [['Generation', 'Members', 'Total Wealth', 'Avg Wealth', 'Family Members']],
        body: genTableData,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
      });

      // ==================== FINAL PAGE: DISCLAIMER & BRANDING ====================
      doc.addPage();
      y = margin;

      y = addHeader('About This Report', y, 18);
      y = addDivider(y);

      y = addText(
        'This report was generated by Seedling, the Generational Wealth Time Machine. ' +
        'The projections and simulations are based on the parameters you provided and ' +
        'historical market averages. Actual results may vary based on economic conditions, ' +
        'individual decisions, and other factors.',
        y
      );

      y += 10;
      y = addSubheader('Disclaimer', y);
      y = addText(
        'This report is for educational and entertainment purposes only and does not ' +
        'constitute financial advice. Please consult with a qualified financial advisor ' +
        'before making any investment decisions. Past performance does not guarantee ' +
        'future results.',
        y
      );

      y += 10;
      y = addSubheader('Methodology', y);
      y = addText(
        'Wealth projections use compound growth models with configurable parameters. ' +
        'Financial health categories are determined by net worth relative to age and ' +
        'generational benchmarks. Family tree simulations account for inheritance, ' +
        'savings rates, and major life events.',
        y
      );

      // Footer branding
      doc.setFontSize(12);
      doc.setTextColor(34, 197, 94);
      doc.text('🌱 SEEDLING', pageWidth / 2, pageHeight - 40, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Generational Wealth Time Machine', pageWidth / 2, pageHeight - 32, { align: 'center' });
      doc.text('Your legacy starts with a single seed.', pageWidth / 2, pageHeight - 24, { align: 'center' });

      // Save the PDF
      const fileName = `Seedling_Wealth_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!simulation?.baseline?.members) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-semibold text-white mb-2">PDF Report Generator</h3>
        <p className="text-slate-400">Run a simulation first to generate your wealth report</p>
      </div>
    );
  }

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center"
          whileHover={{ rotate: [0, -10, 10, 0] }}
        >
          <span className="text-2xl">📄</span>
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-white">PDF Report Generator</h3>
          <p className="text-slate-400">Create a professional wealth report</p>
        </div>
      </div>

      {/* Report type selection */}
      <div className="mb-6">
        <label className="text-slate-400 text-sm mb-2 block">Report Type</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'full', name: 'Full Report', icon: '📊', desc: 'All details' },
            { id: 'summary', name: 'Summary', icon: '📋', desc: 'Key metrics' },
            { id: 'family', name: 'Family Tree', icon: '🌳', desc: 'Members only' },
          ].map((type) => (
            <motion.button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`p-4 rounded-xl text-left transition-all ${
                reportType === type.id
                  ? 'bg-gradient-to-br from-red-500/20 to-rose-500/20 border-2 border-red-500'
                  : 'bg-slate-700/30 border-2 border-transparent hover:border-slate-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">{type.icon}</span>
              <div className="text-white font-semibold mt-2">{type.name}</div>
              <div className="text-slate-400 text-xs">{type.desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Preview info */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
        <h4 className="text-white font-semibold mb-3">Report Preview</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Family Members:</span>
            <span className="text-white ml-2">{simulation.baseline.members.length}</span>
          </div>
          <div>
            <span className="text-slate-400">Generations:</span>
            <span className="text-white ml-2">
              {Math.max(...simulation.baseline.members.map(m => m.generation)) + 1}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Total Wealth:</span>
            <span className="text-green-400 ml-2">
              {formatCurrency(simulation.baseline.members.reduce((sum, m) => sum + m.netWorth, 0))}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Pages:</span>
            <span className="text-white ml-2">~4-5 pages</span>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <motion.button
        onClick={generatePDF}
        disabled={isGenerating}
        className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)' }}
        whileTap={{ scale: 0.98 }}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            Generating PDF...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>📥</span>
            Download PDF Report
          </span>
        )}
      </motion.button>

      {/* Tips */}
      <div className="mt-4 text-center">
        <p className="text-slate-500 text-xs">
          PDF will be downloaded automatically • Works best in modern browsers
        </p>
      </div>
    </motion.div>
  );
};

export default PDFReportGenerator;

'use client';
import { useState } from 'react';
import BillHeading from '../../components/BillHeading';
import ProjectDropdown from '../../components/ProjectDropdown';
import ExpenseDetails from '../../components/ExpenseDetails';
import  generatePDF  from '../../components/pdfGenerator';
import StarryBackground from '@/components/StarryBackground';
import BackButton from '@/components/BackButton';
import ScrollToTopButton from '@/components/scrollup';

export default function Home() {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [expenseData, setExpenseData] = useState(null);

  return (
    <div>
      <BackButton route='/dashboard' />
      <ScrollToTopButton/>
    <div className="flex items-center justify-center min-h-screen text-white">
      <StarryBackground/>
    <div className="p-6 backdrop-blur-sm text-white rounded-xl shadow-md space-y-4 w-full max-w mb-28">  
      <BillHeading />
      <h2 className="text-xl text-white font-semibold">Invoice Generator</h2>
      <ProjectDropdown onSelect={setSelectedProjectId} />
      {selectedProjectId && (
        <ExpenseDetails projectId={selectedProjectId} setExpenseData={setExpenseData} />
      )}
      {expenseData && (
        <button
          onClick={() => generatePDF(expenseData)}
          className="bg-green-600 text-white p-3 rounded mt-4"
        >
          Download PDF
        </button>
      )}
    </div>
    </div>
    </div>
  );
}
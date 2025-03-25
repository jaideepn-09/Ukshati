'use client';
import { useState } from 'react';
import BillHeading from '../../components/BillHeading';
import ProjectDropdown from '../../components/ProjectDropdown';
import ExpenseDetails from '../../components/ExpenseDetails';
import  generatePDF  from '../../components/pdfGenerator';

export default function Home() {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [expenseData, setExpenseData] = useState(null);

  return (
    <div className="p-6 w-full min-h-screen bg-white text-black rounded-xl shadow-md space-y-4">
      <BillHeading />
      <h2 className="text-xl text-black font-semibold">Invoice Generator</h2>
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
  );
}
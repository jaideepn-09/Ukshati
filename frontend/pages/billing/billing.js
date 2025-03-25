'use client';
import { useState, useEffect, useRef } from 'react';
import BillHeading from '../../components/BillHeading';
import ProjectDropdown from '../../components/ProjectDropdown';
import ExpenseDetails from '../../components/ExpenseDetails';
import generatePDF from '../../components/pdfGenerator';
import StarryBackground from '@/components/StarryBackground';
import BackButton from '@/components/BackButton';
import ScrollToTopButton from '@/components/scrollup';

export default function Home() {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [expenseData, setExpenseData] = useState(null);
  const expenseDetailsRef = useRef(null);
  const pdfButtonRef = useRef(null);

  // Scroll to expense details when project is selected
  useEffect(() => {
    if (selectedProjectId && expenseDetailsRef.current) {
      expenseDetailsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [selectedProjectId]);

  // Scroll to PDF button when data is loaded
  useEffect(() => {
    if (expenseData && pdfButtonRef.current) {
      pdfButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [expenseData]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackButton route='/dashboard' />
      <ScrollToTopButton/>
      
      <StarryBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl mb-28 space-y-8 backdrop-blur-lg bg-black/30 rounded-2xl border border-white/10 shadow-2xl p-8 transition-all duration-300">
          <div className="space-y-6">
            <BillHeading />
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
                Invoice Generation System
              </h2>
              <p className="text-gray-400 text-sm">
                Select a project to view detailed expenses and generate invoices
              </p>
            </div>

            <div className="space-y-6">
              <ProjectDropdown onSelect={setSelectedProjectId} />
              
              {selectedProjectId && (
                <div ref={expenseDetailsRef}>
                  <ExpenseDetails 
                    projectId={selectedProjectId} 
                    setExpenseData={setExpenseData} 
                  />
                </div>
              )}
            </div>

            {expenseData && (
              <div ref={pdfButtonRef} className="flex justify-end space-x-4 border-t border-white/10 pt-6">
                <button
                  onClick={() => generatePDF(expenseData)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Generate PDF Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
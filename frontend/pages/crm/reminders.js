import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FiAlertCircle, FiUser, FiClock, FiCalendar, FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import StarryBackground from '@/components/StarryBackground';
import BackButton from '@/components/BackButton';

const ReminderMaintenance = () => {
  const [reminders, setReminders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    message: '',
    date: '',
    time: '',
    customerId: ''
  });

  // Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/crm/reminder' })
        .then(registration => {
          console.log('Service Worker registered');
          return navigator.serviceWorker.ready;
        })
        .then(registration => {
          registration.active.postMessage('startBackgroundChecks');
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, remindersRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/reminders')
        ]);

        if (!customersRes.ok || !remindersRes.ok) throw new Error('Failed to load data');
        
        const customersData = await customersRes.json();
        const remindersData = await remindersRes.json();

        setCustomers(customersData.customers || []);
        setReminders(remindersData);
      } catch (error) {
        showError('Loading Error', 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showError = (title, message) => {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      background: '#1f2937',
      color: '#fff'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: formData.message,
          reminder_date: formData.date,
          reminder_time: formData.time,
          cid: formData.customerId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save reminder');
      }

      // Reload the page to reflect changes
      window.location.reload();
    
      Swal.fire({
        icon: 'success',
        title: 'Reminder Added!',
        text: 'Your reminder has been scheduled successfully',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Save',
        html: `<div class="text-left">
                <p>${error.message}</p>
                ${error.details ? `<p class="text-sm text-gray-500 mt-2">${error.details}</p>` : ''}
              </div>`,
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const deleteReminder = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Delete Reminder?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      background: '#1f2937',
      color: '#fff'
    });

    if (isConfirmed) {
      try {
        await fetch(`/api/reminders?rid=${rid}`, { method: 'DELETE' });
        setReminders(prev => prev.filter(r => r.rid !== Number(rid)));
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Reminder has been deleted',
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#3b82f6'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: error.message,
          background: '#1f2937',
          color: '#fff'
        });
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen p-8">
        <BackButton route='/crm/home'/>
        <StarryBackground/>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Reminder Management</h1>
          <p className="text-gray-400">Schedule and manage customer reminders</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            <FiAlertCircle className="inline mr-2 text-blue-500" />
            New Reminder
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                <FiUser className="inline mr-2" />
                Customer
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none"
                disabled={loading}
                required
              >
                <option value="" className="text-gray-400">Select a customer...</option>
                {loading ? (
                  <option disabled className="text-gray-400">Loading customers...</option>
                ) : (
                  customers.map(customer => (
                    <option 
                      key={customer.cid} 
                      value={customer.cid}
                      className="bg-gray-800 text-white"
                    >
                      {customer.cname}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                <FiMessageSquare className="inline mr-2" />
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                rows="3"
                placeholder="Enter reminder message..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FiCalendar className="inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  <FiClock className="inline mr-2" />
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              Schedule Reminder
            </button>
          </form>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            <FiAlertCircle className="inline mr-2 text-blue-500" />
            Active Reminders
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading reminders...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No active reminders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map(reminder => (
                <div key={reminder.rid} className="bg-gray-700 rounded-xl p-4 flex items-start justify-between hover:bg-gray-600 transition-colors">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-gray-400" />
                      <h3 className="font-medium text-white">{reminder.cname}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMessageSquare className="text-gray-400" />
                      <p className="text-gray-300">{reminder.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="text-gray-400" />
                      <p className="text-sm text-gray-400">
                        {new Date(reminder.datetime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.rid)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    <FiTrash2 className="text-xl" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderMaintenance;
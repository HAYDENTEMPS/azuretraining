'use client';

import { useState } from 'react';

export default function UpdateExplanationsButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/update-explanations', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message,
        });
      } else {
        setMessage({
          type: 'error',
          text: data.message,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update explanations. Please try again.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mt-8 card border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          🔧 Admin Tools
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Update question explanations from updatedExplantations.json
        </p>
        
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Updating...
            </>
          ) : (
            <>Update Explanations</>
          )}
        </button>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import apiClient from '@/utils/apiClient'; // Adjust the import based on your project structure

export interface FormData {
  [key: string]: any;
}

export const useFormHandler = (initialValues: FormData, apiUrl: string, onSubmitSuccess?: () => void) => {
  const [formData, setFormData] = useState<FormData>(initialValues);
  const [originalData, setOriginalData] = useState<FormData>(initialValues);
  const [loading, setLoading] = useState(false);
  const [updateId, setUpdateId] = useState<number | string | null | undefined>(undefined);

  // Handle form changes
  const handleFormChange = (name: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Check if form data has changed
  const isDataChanged = (original: FormData, current: FormData) => {
    return JSON.stringify(original) !== JSON.stringify(current);
  };

  // Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // If there is an ID and no data changes, skip the patch API call
    if (updateId && !isDataChanged(originalData, formData)) {
      console.log('No changes detected, skipping API call.');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (!updateId) {
        // Create a new entry
        response = await apiClient.post(apiUrl, formData);
      } else {
        // Update an existing entry
        response = await apiClient.patch(`${apiUrl}/${updateId}`, {
          id: updateId,
          ...formData,
        });
      }

      if (response) {
        if (onSubmitSuccess) onSubmitSuccess();
        setUpdateId(undefined);
      }
    } catch (error) {
      console.error('Error during form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set form data for editing
  const setEditData = (data: FormData, id: number | string) => {
    setFormData(data);
    setOriginalData(data);
    setUpdateId(id);
  };

  // Reset form data
  const handleReset = () => {
    setFormData(initialValues);
    setUpdateId(undefined);
  };

  return {
    formData,
    handleFormChange,
    handleSubmit,
    handleReset,
    setEditData,
    loading,
  };
};

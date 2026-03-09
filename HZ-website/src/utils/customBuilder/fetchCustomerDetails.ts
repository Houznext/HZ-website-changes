import toast from "react-hot-toast";
import apiClient from "../apiClient";
import { useState, useEffect, useCallback } from "react";

export const useFetchCustomerDetails = (id: number): any => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${apiClient.URLS.customer}/${id}`);
      toast.success("Customer details fetched successfully");
      setData(response?.body);
    } catch (error) {
      toast.error("Failed to fetch the customer details");
      console.log("Error fetching customer details", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return [data, loading];
};

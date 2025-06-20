import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "../../utils/axiosInstance";
import Sidebar from "../../components/AdminSidebar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaLock } from "react-icons/fa";

const schema = yup.object().shape({
  firstName: yup.string().min(2, "First name must be at least 2 letters").required("First name is required"),
  lastName: yup.string().min(2, "Last name must be at least 2 letters").required("Last name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  phoneNumber: yup.string().matches(/^\d{10,15}$/, "Phone number must be 10-15 digits long").required("Phone number is required"),
  note: yup.string(),
  image: yup.string().url("Invalid image URL").nullable(),
});

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get("/api/staff");
      setStaff(res.data.map(s => ({
        ...s,
        verified: s.verified
      })));
    } catch (err) {
      toast.error("Failed to fetch staff");
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm("Are you sure you want to reset this staff member's password?")) return;
  
    try {
      await axios.post(`/api/staff/${id}/reset-password`);
      toast.success("Password has been reset successfully!");
    } catch (err) {
      toast.error("Failed to reset password.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/staff/${id}`);
      setStaff((prev) => prev.filter((s) => s._id !== id));
      toast.success("Staff deleted successfully");
    } catch (err) {
      toast.error("Error deleting staff");
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      const updatedData = {
        ...data,
        verified: Boolean(data.verified), // Ensure it's a boolean
      };

      if (modalData?._id) {
        const res = await axios.put(`/api/staff/${modalData._id}`, updatedData);
        setStaff((prev) =>
          prev.map((s) => (s._id === modalData._id ? { ...s, ...res.data.staff } : s))
        );
        toast.success("Staff updated successfully");
      } else {
        const res = await axios.post("/api/staff", { 
          ...updatedData, 
          password: "default123", 
          roleName: "Staff",
          verified: Boolean(data.verified)
        });
        setStaff((prev) => [...prev, res.data.staff]);
        toast.success("Staff added successfully");
      }
    } catch (err) {
      toast.error("Error saving staff");
    }
    setModalData(null);
  };

  const handleSort = (field) => {
    setSortBy(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredStaff = staff.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedStaff = sortedStaff.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-100 shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Staff Management</h2>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300"
          onClick={() => setModalData({})}
        >
          Add Staff
        </button>
          <input
            type="text"
            placeholder="Search..."
            className="p-2 border mt-5 rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        <div className="overflow-x-auto mt-6 bg-white shadow-md rounded-lg">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-b p-3 text-left">First Name</th>
                <th className="border-b p-3 text-left">Last Name</th>
                <th className="border-b p-3 text-left">Email</th>
                <th className="border-b p-3 text-left">Phone</th>
                <th className="border-b p-3 text-left">Verified</th>
                <th className="border-b p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member._id} className="hover:bg-gray-100">
                  <td className="border-b p-3">{member.firstName}</td>
                  <td className="border-b p-3">{member.lastName}</td>
                  <td className="border-b p-3">{member.email}</td>
                  <td className="border-b p-3">{member.phoneNumber}</td>
                  <td className="p-3 text-sm">
                    {member.verified ? (
                      <i className="fas fa-check-circle text-green-500"></i>
                    ) : (
                      <i className="fas fa-times-circle text-red-500"></i>
                    )}
                  </td>
                  <td className="border-b p-3">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-full mr-2 hover:bg-blue-600 transition-all duration-200"
                      onClick={() => setModalData(member)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-full mr-2 hover:bg-red-600 transition-all duration-200"
                      onClick={() => handleDelete(member._id)}
                    >
                      <FaTrash />
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 mr-2 transition-all duration-200"
                      onClick={() => handleResetPassword(member._id)}
                    >
                      <FaLock />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {modalData !== null && <StaffForm data={modalData} onSubmit={handleFormSubmit} onClose={() => setModalData(null)} />}
      </div>
    </div>
  );
}

function StaffForm({ data, onSubmit, onClose }) {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || "",
      verified: data.verified || false, // Ensure `verified` has a default boolean value
    },
  });

  useEffect(() => {
    reset({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || "",
      verified: !!data.verified, // Ensure it's always a boolean (true/false)
    });
  }, [data, reset]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">{data?._id ? "Update" : "Add"} Staff</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {["firstName", "lastName", "email", "phoneNumber"].map((field) => (
            <div key={field}>
              <input
                {...register(field)}
                className="w-full p-3 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
              {errors[field] && <p className="text-red-500 text-sm">{errors[field]?.message}</p>}
            </div>
          ))}

          {/* Verified Toggle */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              {...register("verified")}
              id="verified"
              className="mr-2"
              checked={watch("verified")}
              onChange={(e) => reset({ ...watch(), verified: e.target.checked })}
            />
            <label htmlFor="verified" className="text-sm font-medium">Verified</label>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-all duration-300">
              Save
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition-all duration-300"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

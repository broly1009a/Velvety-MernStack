import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "../../utils/axiosInstance";
import Sidebar from "../../components/AdminSidebar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaLock, FaTrash } from "react-icons/fa";

// Validation schema for form inputs
const schema = yup.object().shape({
  firstName: yup
    .string()
    .min(2, "First name must be at least 2 letters")
    .required("First name is required"),
  lastName: yup
    .string()
    .min(2, "Last name must be at least 2 letters")
    .required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phoneNumber: yup
    .string()
    .matches(/^\d{10,15}$/, "Phone number must be 10-15 digits long")
    .required("Phone number is required"),
  note: yup.string(),
  image: yup.string().url("Invalid image URL").nullable(),
  certifications: yup.array().of(yup.string().required("Certification is required")).nullable(),
  category: yup.array().of(yup.string().required("Category is required")).nullable(),
});

export default function ConsultantManagement() {
  const [consultants, setConsultants] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNote, setSelectedNote] = useState(null);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      const res = await axios.get("/api/consultants");
      setConsultants(
        res.data.map((c) => ({
          ...c,
          note: c.note,
          image: c.image,
          verified: c.verified,
          certifications: c.certifications,
          category: c.category,
        }))
      );
    } catch (err) {
      toast.error("Failed to fetch consultants");
    }
  };

  const handleSort = (column) => {
    const order = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(order);
  };

  const filteredConsultants = consultants.filter((c) =>
    Object.values(c).some((val) =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedConsultants = [...filteredConsultants].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "boolean")
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    if (typeof aValue === "number")
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;

    return sortOrder === "asc"
      ? aValue?.toString().localeCompare(bValue?.toString())
      : bValue?.toString().localeCompare(aValue?.toString());
  });

  const totalPages = Math.ceil(sortedConsultants.length / itemsPerPage);
  const displayedConsultants = sortedConsultants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/consultants/${id}`);
      setConsultants((prev) => prev.filter((c) => c._id !== id));
      toast.success("Consultant deleted successfully");
    } catch (err) {
      toast.error("Error deleting consultant");
    }
  };

  const handleResetPassword = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to reset this consultant's password?"
      )
    )
      return;

    try {
      await axios.post(`/api/consultants/${id}/reset-password`);
      toast.success("Password has been reset successfully!");
    } catch (err) {
      toast.error("Failed to reset password.");
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      const updatedData = {
        ...data,
        verified: Boolean(data.verified),
        certifications: Array.isArray(data.certifications)
          ? data.certifications
          : data.certifications.split(",").map((cert) => cert.trim()), // Ensure certifications is an array
        category: Array.isArray(data.category)
          ? data.category
          : data.category.split(",").map((cat) => cat.trim()), // Ensure category is an array
      };

      if (modalData?._id) {
        const res = await axios.put(
          `/api/consultants/${modalData._id}`,
          updatedData
        );
        setConsultants((prev) =>
          prev.map((c) =>
            c._id === modalData._id ? { ...c, ...res.data.consultant } : c
          )
        );
        toast.success("Consultant updated successfully");
      } else {
        const res = await axios.post("/api/consultants", {
          ...updatedData,
          password: "default123",
          roleName: "Consultant",
        });
        setConsultants((prev) => [...prev, res.data.consultant]);
        toast.success("Consultant added successfully");
      }
    } catch (err) {
      toast.error("Error saving consultant");
    }
    setModalData(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Consultant Management
        </h2>
        <button
          className="bg-blue-500  text-white px-6 py-3 rounded-full mb-6 shadow-lg hover:bg-blue-600 transition-all duration-300"
          onClick={() => setModalData({})}
        >
          Add Consultant
        </button>
          <input
            type="text"
            placeholder="Search..."
            className="p-2 mb-4 border rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                {[
                  "firstName",
                  "lastName",
                  "email",
                  "phoneNumber",
                  "note",
                  "verified",
                ].map((col) => (
                  <th
                    key={col}
                    className="p-3 text-left text-sm font-medium text-gray-700"
                  >
                    <button
                      onClick={() => handleSort(col)}
                      className="flex items-center"
                    >
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                      {sortColumn === col ? (
                        sortOrder === "asc" ? (
                          <span className="ml-1">▲</span> // Up arrow for ascending
                        ) : (
                          <span className="ml-1">▼</span> // Down arrow for descending
                        )
                      ) : (
                        <span className="ml-1 text-gray-400">↕</span> // Default sort icon
                      )}
                    </button>
                  </th>
                ))}
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Image
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Certifications
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Category
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedConsultants.map((consultant) => (
                <tr
                  key={consultant._id}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="p-3 text-sm">{consultant.firstName}</td>
                  <td className="p-3 text-sm">{consultant.lastName}</td>
                  <td className="p-3 text-sm">{consultant.email}</td>
                  <td className="p-3 text-sm">{consultant.phoneNumber}</td>
                  <td className="p-3 text-sm">
                    <span
                      className="cursor-pointer text-blue-500 underline"
                      onClick={() => setSelectedNote(consultant.note)}
                    >
                      {consultant.note?.length > 20
                        ? `${consultant.note.substring(0, 20)}...`
                        : consultant.note}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {consultant.verified ? (
                      <i className="fas fa-check-circle text-green-500"></i>
                    ) : (
                      <i className="fas fa-times-circle text-red-500"></i>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    {consultant.image ? (
                      <img
                        src={consultant.image}
                        alt="Consultant"
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    <span
                      className="cursor-pointer text-blue-500 underline"
                      onClick={() =>
                        setSelectedNote(
                          consultant.certifications?.join(", ") || "No Certifications"
                        )
                      }
                    >
                      {consultant.certifications?.length > 2
                        ? `${consultant.certifications.slice(0, 2).join(", ")}...`
                        : consultant.certifications?.join(", ") || "No Certifications"}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {consultant.category?.join(", ") || "No Categories"}
                  </td>
                  <td className="p-3 text-sm">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 mr-2"
                      onClick={() => setModalData(consultant)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
                      onClick={() => handleDelete(consultant._id)}
                    >
                      <FaTrash />
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 mr-2"
                      onClick={() => handleResetPassword(consultant._id)}
                    >
                      <FaLock />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {modalData !== null && (
          <ConsultantForm
            data={modalData}
            onSubmit={handleFormSubmit}
            onClose={() => setModalData(null)}
          />
        )}
        {selectedNote && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl font-bold mb-4">Full Note</h3>
              <p className="text-gray-700 mb-6">{selectedNote}</p>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                onClick={() => setSelectedNote(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-center space-x-2 mt-4">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConsultantForm({ data, onSubmit, onClose }) {
  const categories = ["Oily", "Dry", "Combination", "Normal"]; // Available categories
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || "",
      note: data.note || "",
      image: data.image || "",
      verified: data.verified || false,
      certifications: data.certifications || [],
      category: data.category || [],
    },
  });

  useEffect(() => {
    reset({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || "",
      note: data.note || "",
      image: data.image || "",
      verified: !!data.verified,
      certifications: data.certifications || [],
      category: data.category || [],
    });
  }, [data, reset]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-8 rounded-lg w-1/3 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {data?._id ? "Update Consultant" : "Add Consultant"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {[
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "note",
            "image",
          ].map((field) => (
            <div key={field} className="mb-4">
              <input
                {...register(field)}
                className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
              {errors[field] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[field]?.message}
                </p>
              )}
            </div>
          ))}

          {/* Certifications Input */}
          <div className="mb-4">
            <textarea
              {...register("certifications")}
              className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Certifications (comma-separated)"
              defaultValue={data.certifications?.join(", ")} // Display certifications as a comma-separated string
              onBlur={(e) =>
                reset({
                  ...watch(),
                  certifications: e.target.value
                    .split(",")
                    .map((cert) => cert.trim())
                    .filter((cert) => cert), // Convert input to array and remove empty values
                })
              }
            />
            {errors.certifications && (
              <p className="text-red-500 text-sm mt-1">
                {errors.certifications.message}
              </p>
            )}
          </div>

          {/* Category Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={cat}
                    {...register("category")}
                    defaultChecked={data.category?.includes(cat)}
                    className="form-checkbox h-4 w-4 text-green-500"
                  />
                  <span className="text-sm text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Verified Toggle */}
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              {...register("verified")}
              id="verified"
              className="mr-3"
              checked={watch("verified")}
              onChange={() =>
                reset({ ...watch(), verified: !watch("verified") })
              }
            />
            <label htmlFor="verified" className="text-gray-700 font-medium">
              Verified
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600"
            >
              Save
            </button>
            <button
              type="button"
              className="bg-gray-500 text-white px-6 py-3 rounded-full hover:bg-gray-600"
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

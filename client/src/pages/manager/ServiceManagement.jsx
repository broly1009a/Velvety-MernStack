import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import { useForm } from "react-hook-form";
import Sidebar from "../../components/ManagerSidebar";
import ReactQuill from 'react-quill';
import "react-quill/dist/quill.snow.css";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Pagination } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const ITEMS_PER_PAGE = 6; // Number of services per page

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState(editingService?.category || []);
  const [selectedStatus, setSelectedStatus] = useState(editingService?.status || "");
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedCategories((prev) => [...prev, value]);
    } else {
      setSelectedCategories((prev) => prev.filter((category) => category !== value));
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value); // This will set the selected status
  };

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      detaildescription: "",
    }
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1); // Add state for current page

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    console.log("Editing Service Data:", editingService);
  }, [editingService]);

  useEffect(() => {
    if (editingService) {
      setValue("detaildescription", editingService.detaildescription || "");
    }
  }, [editingService, setValue]);  // Depend on `editingService` and `setValue`

  const fetchServices = async () => {
    try {
      const response = await axios.get("/api/services");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services", error);
      toast.error("Failed to load services.");
    }
  };

  const onSubmit = async (data) => {
    try {
      const imageRegex = /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i;
      if (data.image && !imageRegex.test(data.image)) {
        toast.error("Invalid image URL");
        return;
      }
      // Thêm validation tương tự cho effectimage, resultimage, sensationimage

      const formattedData = {
        ...data,
        price: Number(data.price),
        category: selectedCategories,
        status: selectedStatus,
        image: data.image || "",
        effectimage: data.effectimage || "",
        resultimage: data.resultimage || "",
        sensationimage: data.sensationimage || ""
      };
      console.log("Sending data:", formattedData);

      if (editingService) {
        if (!editingService._id) {
          throw new Error("Invalid service ID");
        }
        await axios.put(`/api/services/${editingService._id}`, formattedData);
        toast.success("Service updated successfully!");
      } else {
        await axios.post("/api/services", formattedData);
        toast.success("Service created successfully!");
      }
      reset();
      setEditingService(null);
      setSelectedCategories([]);
      setSelectedStatus("");
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      console.log("Error response:", error.response?.data);
      toast.error(`Failed to save service: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    reset(); // Reset the form state to initial values

    // Set form values directly after reset
    setValue("name", service.name || "");
    setValue("price", service.price || "");
    setValue("image", service.image || "");
    setValue("effectimage", service.effectimage || "");
    setValue("resultimage", service.resultimage || "");
    setValue("sensationimage", service.sensationimage || "");
    setValue("description", service.description || "");
    setValue("detaildescription", service.detaildescription || "");
    setSelectedCategories(service.category || []); // Handle categories as an array
    setSelectedStatus(service.status || ""); // Handle status as a string
    setValue("category", service.category || "");
    setValue("status", service.status || "");

    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to the top after editing starts
  };


  const handleDelete = async () => {
    try {
      await axios.delete(`/api/services/${serviceToDelete._id}`);
      toast.success("Service deleted successfully!");
      fetchServices();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting service", error);
      toast.error("Failed to delete service.");
    }
  };

  const openDeleteConfirmation = (service) => {
    setServiceToDelete(service);
    setOpenDeleteDialog(true);
  };

  const closeDeleteConfirmation = () => {
    setOpenDeleteDialog(false);
    setServiceToDelete(null);
  };

  const filteredServices = services
    .filter(service => service.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE); // Calculate total pages
  const currentServices = filteredServices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE); // Get services for current page

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 w-full">
        <ToastContainer />
        <h2 className="text-2xl font-bold mb-4">Service Management</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-100 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-4">Service Details</h3>

          {/* Service Name */}
          <div>
            <label className="block text-gray-700 mb-2">Service Name</label>
            <input
              {...register("name", { required: true })}
              placeholder="Enter service name"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 mb-2">Price</label>
            <input
              {...register("price", { required: true })}
              type="number"
              placeholder="Enter price"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Images Section */}
          <div>
            <h4 className="block text-gray-700 mb-2">Images</h4>
            <div className="space-y-4">
              <div>
                <input
                  {...register("image")}
                  placeholder="Image URL"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editingService?.image && (
                  <img src={editingService.image} alt="Service Preview" className="w-32 h-32 object-cover mt-2" />
                )}
              </div>

              <div>
                <input
                  {...register("effectimage")}
                  placeholder="Effect Image URL"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editingService?.effectimage && (
                  <img src={editingService.effectimage} alt="Effect Preview" className="w-32 h-32 object-cover mt-2" />
                )}
              </div>

              <div>
                <input
                  {...register("resultimage")}
                  placeholder="Result Image URL"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editingService?.resultimage && (
                  <img src={editingService.resultimage} alt="Result Preview" className="w-32 h-32 object-cover mt-2" />
                )}
              </div>

              <div>
                <input
                  {...register("sensationimage")}
                  placeholder="Sensation Image URL"
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editingService?.sensationimage && (
                  <img src={editingService.sensationimage} alt="Sensation Preview" className="w-32 h-32 object-cover mt-2" />
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              {...register("description")}
              placeholder="Enter a brief description"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <div className="space-x-4">
              {["Oily", "Dry", "Combination", "Normal"].map((category) => (
                <label key={category} className="inline-flex items-center">
                  <input
                    {...register("category", { required: true })}
                    type="checkbox"
                    value={category}
                    checked={selectedCategories.includes(category)}
                    onChange={handleCategoryChange}
                    className="form-checkbox"
                  />
                  <span className="ml-2">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <div className="space-x-4">
              {["active", "inactive"].map((statusOption) => (
                <label key={statusOption} className="inline-flex items-center">
                  <input
                    {...register("status", { required: true })}
                    type="radio"
                    value={statusOption}
                    checked={selectedStatus === statusOption} // Check if this is the selected status
                    onChange={handleStatusChange} // Update state when the status changes
                    className="form-radio"
                  />
                  <span className="ml-2 capitalize">{statusOption}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <ReactQuill
              value={watch("detaildescription") || ""}
              onChange={(value) => setValue("detaildescription", value)}
              placeholder="Enter detailed description"
              className="w-full border rounded-md"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            {editingService ? "Update" : "Create"} Service
          </button>
        </form>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Service List</h3>
            <div className="flex space-x-2">
              <input type="text" placeholder="Search Services" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="p-2 border rounded w-64" />
              <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="bg-gray-500 text-white px-4 py-2 rounded">
                {sortOrder === "asc" ? "Sort Z-A" : "Sort A-Z"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentServices.map((service) => (
              <div key={service._id} className="border p-4">
                {service.image && <img src={service.image} alt="Service" className="w-10 h-10 object-cover mb-2" />}
                <h4 className="text-lg font-bold">{service.name}</h4>
                <p>{service.description}</p>
                <div className="flex space-x-2 mt-4">
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEdit(service)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => openDeleteConfirmation(service)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              color="primary"
            />
          </div>
        </div>
      </div>

      <Dialog open={openDeleteDialog} onClose={closeDeleteConfirmation}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this service?</DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation} color="primary">Cancel</Button>
          <Button onClick={handleDelete} color="secondary">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ServiceManagement;

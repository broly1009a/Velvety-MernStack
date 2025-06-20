import { Button } from "@/components/ui/button";  // Assuming this is the correct import path
import { FaTrashAlt, FaEdit } from "react-icons/fa";  // Example icons from react-icons

const IconButton = ({ icon, onClick, label, variant = "default" }) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      className="p-2 rounded-full flex items-center justify-center"  // Adds padding and centers the icon
    >
      {icon && React.cloneElement(icon, { className: "w-5 h-5" })} {/* Set icon size */}
      {label && <span className="ml-2">{label}</span>} {/* Optional label */}
    </Button>
  );
};

export default function StaffManagement() {
  const handleDelete = (id) => {
    console.log("Deleted staff with id: ", id);
  };

  const handleUpdate = (id) => {
    console.log("Updating staff with id: ", id);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Staff Management</h2>
      {/* Example use of IconButton */}
      <div className="flex gap-4">
        <IconButton
          icon={<FaEdit />}
          onClick={() => handleUpdate(1)}
          variant="primary"
          label="Edit"
        />
        <IconButton
          icon={<FaTrashAlt />}
          onClick={() => handleDelete(1)}
          variant="danger"
          label="Delete"
        />
      </div>
    </div>
  );
}

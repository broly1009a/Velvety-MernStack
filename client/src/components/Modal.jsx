import React from "react";

const Modal = ({ showModal, result, onClose }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold text-center mb-4">Your Skin Type: {result}</h2>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-[#fb5b76] text-white py-2 px-4 rounded-md hover:bg-[#fd4867] transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

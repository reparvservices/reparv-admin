import React from "react";
import { MdDelete } from "react-icons/md";

function DeleteButton({func}) {
  return (
    <div
      onClick={() => {
        func(true);
      }}
      className="deleteButton z-10 px-2 lg:px-4 py-[6px] cursor-pointer flex items-center justify-center gap-2 border border-[#00000033] rounded-tr-md rounded-bl-md bg-[#e01a1a] font-semibold text-4 leading-5 text-[#FFFFFF] active:scale-[0.98]"
    >
      <p className="hidden lg:block">Delete</p>
      <MdDelete className="text-[20px]" />
    </div>
  );
}

export default DeleteButton;

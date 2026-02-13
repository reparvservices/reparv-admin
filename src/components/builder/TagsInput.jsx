import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";

export default function TagsInput({ label, name, value, setField }) {
  const [inputText, setInputText] = useState("");

  // Convert comma string to array safely
  const currentTags = value
    ? value.split(",").map((tag) => tag.trim()).filter(Boolean)
    : [];

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();

      const newTag = inputText.trim();
      if (!newTag) return;

      if (!currentTags.includes(newTag)) {
        const updatedTags = [...currentTags, newTag];

        setField((prev) => ({
          ...prev,
          [name]: updatedTags.join(","),
        }));
      }

      setInputText("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = currentTags.filter(
      (tag) => tag !== tagToRemove
    );

    setField((prev) => ({
      ...prev,
      [name]: updatedTags.join(","),
    }));
  };

  return (
    <div className="w-full">
      <label
        className={`${
          currentTags.length > 0 ? "text-green-600" : "text-[#00000066]"
        } block text-sm leading-4 font-medium`}
      >
        {label} <span className="text-red-600">*</span>
      </label>

      <div className="w-full mt-2 flex flex-wrap items-center gap-2 p-2 border border-[#00000033] rounded-[4px] focus-within:ring-2 focus-within:ring-green-600">
        
        {currentTags.map((tag, index) => (
          <span
            key={index}
            className="bg-green-50 text-green-600 border-[1.5px] border-green-600 rounded-2xl font-medium px-3 py-1 text-sm flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 text-red-500 text-base font-bold"
            >
              <IoMdClose />
            </button>
          </span>
        ))}

        <input
          type="text"
          placeholder="Enter tag and press Enter"
          className="flex-1 p-2 text-[16px] font-medium focus:outline-none placeholder:text-black"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
import React from "react";
import { IoMdEye } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useAuth } from "../../store/auth";
import { useState } from "react";
import TicketingFilter from "./TicketingFilter";
import CustomDateRangePicker from "../CustomDateRangePicker";
import { MdFormatColorText } from "react-icons/md";
import { CgAttachment } from "react-icons/cg";
import toolbarIcon from "../../assets/toolbarIcon.svg";
import { MdEmojiEmotions } from "react-icons/md";
import { FaGoogleDrive } from "react-icons/fa";
import { BiSolidPhotoAlbum } from "react-icons/bi";
import { MdOutlineLockClock } from "react-icons/md";
import { FaPenAlt } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

const TicketingInfo = () => {
  const { setShowTicketInfo, action } = useAuth();
  const [selectedAction, setSelectedAction] = useState("");

  return (
    <div className="ticketing-table w-full max-w-[1136px] h-[578px] flex flex-col p-6 gap-4 my-[10px] bg-white rounded-[24px]">
      <div className="ticketInfoHead w-full max-w-[1088px] flex flex-wrap sm:flex-row items-center justify-between gap-3">
        <div className="selectIssue relative inline-block">
          <div className="flex gap-2 items-center justify-between bg-white border border-[#00000033] text-sm font-semibold  text-black rounded-lg py-1 px-3 focus:outline-none focus:ring-2 focus:ring-[#076300]">
            <span>{selectedAction || "Select Issue"}</span>
            <RiArrowDropDownLine className="w-6 h-6 text-[#000000B2]" />
          </div>
          <select
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            value={selectedAction}
            onChange={(e) => {
              const action = e.target.value;
              setSelectedAction(action);
            }}
          >
            <option value="" disabled>
              Select Issue
            </option>
            <option value="Technical Issue">Technical Issue</option>
            <option value="Commission Issue">Commission Issue</option>
            <option value="Lead Issue">Lead Issue</option>
          </select>
        </div>

        <TicketingFilter />

        <CustomDateRangePicker />
      </div>

      <div className="flex items-start">
        <div className="description w-[90%]">
          <label
            htmlFor="description"
            className="block m-1 text-xs text-[#00000066]"
          >
            Description :
          </label>
          <textarea
            id="description"
            className="w-full h-[107px] overflow-scroll scrollbar-hide border border-[#00000033] p-3 focus:outline-none focus:ring-2 focus:ring-[#E3FFDF] "
            placeholder="Full Description of technical Issue"
          ></textarea>
        </div>

        <div className="mediaView w-[100px] flex flex-col items-center justify-center gap-4 ">
          <label
            htmlFor="description"
            className="block m-1 text-xs text-[#00000066]"
          >
            Media View
          </label>
          <IoMdEye className="w-5 h-5 text-[#2660ff]" />
          <IoMdEye className="w-5 h-5 text-[#2660ff]" />
        </div>
      </div>

      <div>
        <label
          htmlFor="resolveFeedback"
          className="block m-1 text-xs text-[#00000066]"
        >
          Resolve Feedback
        </label>
        <div className="w-full border border-[#00000033]">
          <textarea
            id="resolveFeedback"
            className="w-full h-[70px] overflow-scroll scrollbar-hide p-3 focus:outline-none"
            placeholder="Enter comment here"
          ></textarea>
          <div className="flex justify-between attachmentBtn w-full h-[40px] px-3 ">
            <div className="flex gap-2 sm:gap-4 text-[#0000008A] text-base sm:text-[20px]">
              <MdFormatColorText className="text-base sm:text-[20px] cursor-pointer" />
              <CgAttachment className="cursor-pointer"/>
              <img src={toolbarIcon} alt="" className="w-5 h-5 sm:w-7 sm:h-7 cursor-pointer" />
              <MdEmojiEmotions className="cursor-pointer" />
              <FaGoogleDrive className="cursor-pointer"/>
              <BiSolidPhotoAlbum className="cursor-pointer" />
              <MdOutlineLockClock className="cursor-pointer" />
              <FaPenAlt className="cursor-pointer" />
            </div>
            <div className="Btn w-7 h-7 flex items-center justify-center rounded-full bg-[#076300] text-white">
              <IoSend className="" />
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center gap-6 mt-5">
          <button
            onClick={() => {
              setShowTicketInfo(false);
            }}
            className="bg-[#0000008A] text-white px-4 py-2 rounded-lg active:scale-95 cursor-pointer"
          >
            Cancel
          </button>
          <button
            className="text-white px-4 py-2 rounded-lg bg-[#076300] active:scale-95 cursor-pointer"
          >
            <p>{action}</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketingInfo;

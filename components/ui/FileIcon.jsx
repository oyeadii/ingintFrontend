import React from "react"

// Define a mapping of file extensions to their corresponding icons
const fileIcons = {
  pdf: "bg-red-500",
  xlsx: "bg-green-500",
  docx: "bg-blue-500",
  doc: "bg-blue-500",
  ppt: "bg-red-500",
  pptx: "bg-red-500",

  png: "/assets/images/icon/image.svg",
  txt: "/assets/images/icon/text.svg",
  // Add more file types and their icons as needed
}
const FileIcon = ({ fileName }) => {
  // Extract the file extension from the fileName
  const extension = fileName?.split(".").pop().toLowerCase() || ".pdf"

  // Check if the extension exists in the fileIcons mapping
  return (
    <div
      className={` mr-2 w-8 h-8  rounded-md ${
        fileIcons[extension] || "bg-blue-500"
      }  text-white flex items-center justify-center text-xs`}
    >
      {extension}
    </div>
  )
}
export default FileIcon

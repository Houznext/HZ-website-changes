import FileInput from "@/src/common/FileInput";
import CustomInput from "@/src/common/FormElements/CustomInput";
import RichTextEditor from "@/src/common/FormElements/RichTextEditor";
import { Button } from "@headlessui/react";
import React, { useState } from "react";

const BlogsForm = () => {
  const [blogDetails, setBlogDetails] = useState({
    title: "",
    link: "",
    description: "",
    thumbnail: "",
    coverImage: "",
    status: "regular",
    type: "General",
    content: "",
  });

  const handleThumbnailChange = async (url: string) => {
    setBlogDetails((prev) => ({ ...prev, thumbnail: url }));
  };

  const handleCoverImageChange = async (url: string) => {
    setBlogDetails((prev) => ({ ...prev, coverImage: url }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setBlogDetails((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Blog Data Submitted:", blogDetails);
  };

  return (
    <form className="overflow-y-auto" onSubmit={handleSubmit}>
      <div className="font-bold text-2xl">Add New Blog</div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20 gap-5 mt-3">
        <CustomInput
          label="Title"
          name="title"
          type="text"
          placeholder="Enter title"
          value={blogDetails.title}
          onChange={handleInputChange}
          required
        />

        <CustomInput
          label="External resource link"
          name="link"
          type="url"
          placeholder="Enter the link"
          value={blogDetails.link}
          onChange={handleInputChange}
        />
      </div>

      <div className="md:mt-10 mt-5">
        <CustomInput
          label="Description Preview"
          name="description"
          type="textarea"
          className="text-[12px] placeholder:text-[12px]"
          placeholder="Enter description preview"
          value={blogDetails.description}
          onChange={handleInputChange}
        />
      </div>

      <div className="md:mt-10 mt-5 grid grid-cols-1 md:grid-cols-2 md:gap-20 gap-5">
        <FileInput
          type={"file"}
          label="Upload Thumbnail"
          labelCls="text-[16px] text-[#3B82F6] font-medium"
          onFileChange={handleThumbnailChange}
          initialFileUrl={blogDetails?.thumbnail}
          folderName="blogs"
        />

        <FileInput
          type={"file"}
          label="Upload Cover Image"
          labelCls="text-[16px] text-[#3B82F6] font-medium"
          onFileChange={handleCoverImageChange}
          initialFileUrl={blogDetails?.coverImage}
           folderName="blogs"
        />
      </div>

      <div className="md:mt-10 mt-5 grid grid-cols-1 md:grid-cols-2 md:gap-20 gap-5">
        {/* Blog Status Dropdown */}
        <div>
          <label className="font-semibold text-sm md:text-lg  mb-3 block">
            Blog status
          </label>
          <select
            name="status"
            value={blogDetails.status}
            onChange={handleInputChange}
            className="border-gray-400 px-2 py-1 w-full border-[1px] rounded"
          >
            <option value="regular">Regular</option>
            <option value="trending">Trending</option>
            <option value="featured">Featured</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-sm md:text-lg  mb-3 block">
            Blog Type
          </label>
          <select
            name="type"
            value={blogDetails.type}
            onChange={handleInputChange}
            className="border-gray-400 px-2 py-1 w-full border-[1px] rounded"
          >
            {[
              "Furniture",
              "Interiors",
              "Residential Construction",
              "Construction for Business",
              "General",
              "Custom Builder",
              "Paints",
              "Electronics",
              "Vaastu Consultation",
              "Civil Engineering",
              "RealEstate",
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="md:mt-10 mt-5 md:gap-20 gap-5">
        <label className="font-semibold text-sm md:text-lg  mb-3 block">
          Blog Content
        </label>
        <RichTextEditor
          type="richtext"
          className="min-h-[200px]"
          placeholder="Add content"
          onChange={(content) => setBlogDetails((prev) => ({ ...prev, content }))}
        />
      </div>

      <div className="flex justify-end md:mt-8 mt-5">
        <Button type="submit" className="bg-blue-600 text-white font-regular px-2 py-1 rounded">
          Submit
        </Button>
      </div>
    </form>
  );
};

export default BlogsForm;

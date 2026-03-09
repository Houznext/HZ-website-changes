import React, { useState } from "react";
import { SketchPicker } from "react-color";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import Button from "@/src/common/Button";
import CustomInput from "@/src/common/FormElements/CustomInput";
import Modal from "@/src/common/Modal";

const ColorSchemeEditor = ({ colorSchemeList = [], onChange }) => {
    const [openModal, setOpenModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [colorScheme, setColorScheme] = useState({ label: "", color: "#ffffff" });

    const handleColorChange = (key, value) => {
        setColorScheme((prev) => ({ ...prev, [key]: value }));
    };

    const handleColorSave = () => {
        let updated = [...colorSchemeList];

        if (editIndex !== null) {
            updated[editIndex] = colorScheme;
        } else {
            updated.push(colorScheme);
        }

        onChange(updated);
        setColorScheme({ label: "", color: "#ffffff" });
        setEditIndex(null);
        setOpenModal(false);
    };

    const handleColorDelete = (index) => {
        const updated = colorSchemeList.filter((_, i) => i !== index);
        onChange(updated);
    };

    const handleColorEdit = (index) => {
        const selected = colorSchemeList[index];
        setColorScheme(selected);
        setEditIndex(index);
        setOpenModal(true);
    };

    return (
        <div className="w-full h-[180px] basis-[40%] flex flex-col">
            <label className="text-black text-[14px] font-medium mb-4 block ">
                Color Scheme
            </label>
            <div className="w-full h-36 py-1 flex flex-col rounded-[6px] bg-white shadow-md">
                <div className="flex items-center justify-between px-4 py-2">
                    <p className="text-black text-[14px] font-medium">Colors</p>
                    <Button
                        className="h-[30px] w-[30px] rounded-full font-medium bg-[#3B82F6]/10 flex justify-center items-center"
                        onClick={() => {
                            setColorScheme({ label: "", color: "#ffffff" });
                            setEditIndex(null);
                            setOpenModal(true);
                        }}
                        size="sm"
                    >
                        <MdAdd className="h-5 w-5 text-[#3B82F6]" />
                    </Button>
                </div>

                {colorSchemeList?.length > 0 ? (
                    <div className="w-full flex flex-col gap-2 items-center px-4 overflow-y-auto mb-2">
                        {colorSchemeList.map((item, index) => (
                            <div
                                className="w-full grid grid-cols-3 items-center border-[2px] border-gray-200 py-2 px-2 rounded-[6px]"
                                key={index}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded-full border"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-[12px] text-gray-700 font-medium">
                                        {item.color}
                                    </span>
                                </div>
                                <p className="text-[14px] font-medium">{item.label}</p>


                                <div className="flex justify-end px-2 gap-2">
                                    <MdDelete
                                        className="w-4 h-5 text-[#3B82F6] cursor-pointer"
                                        onClick={() => handleColorDelete(index)}
                                    />
                                    <MdEdit
                                        className="w-4 h-5 text-[#3B82F6] cursor-pointer"
                                        onClick={() => handleColorEdit(index)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-[16px] text-center font-medium">
                        No colors added
                    </p>
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={openModal}
                closeModal={() => {
                    setColorScheme({ label: "", color: "#ffffff" });
                    setOpenModal(false);
                    setEditIndex(null);
                }}
                className="max-w-[320px] max-h-[700px] relative"
                isCloseRequired={false}
            >
                <Button
                    onClick={() => {
                        setOpenModal(false);
                        setColorScheme({ label: "", color: "#ffffff" });
                        setEditIndex(null);
                    }}
                    className="text-gray-400 hover:text-gray-500 absolute top-2 right-2"
                >
                    <IoClose className="h-6 w-6 text-[#3B82F6]" />
                </Button>

                <div className="flex flex-col gap-2 items-center">
                    <div className="w-full">
                        <CustomInput
                            label="Place"
                            labelCls="text-black text-[14px] font-medium mb-3"
                            name="place"
                            value={colorScheme.label}
                            onChange={(e) => handleColorChange("label", e.target.value)}
                            type="text"
                            placeholder="Kitchen, cupboard, etc."
                            className="w-full p-[6px]"
                            rootCls="mb-4"
                        />
                    </div>

                    <div className="w-full">
                        <label className="text-black text-[14px] font-medium mb-2 block">
                            Color Scheme
                        </label>
                        <SketchPicker
                            color={colorScheme.color}
                            onChangeComplete={(color) => handleColorChange("color", color.hex)}
                            className="bg-transparent shadow-none"
                        />
                    </div>

                    <div className="w-full flex justify-between mt-3">
                        <Button
                            className="px-[15px] py-[7px] border-[#3B82F6] text-white bg-gray-300 rounded-md btn-text"
                            onClick={() => {
                                setOpenModal(false);
                                setColorScheme({ label: "", color: "#ffffff" });
                                setEditIndex(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="px-[20px] py-[7px] bg-[#3B82F6] text-white rounded-md btn-text"
                            onClick={handleColorSave}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ColorSchemeEditor;

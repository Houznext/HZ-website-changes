import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import Modal from "@/common/Modal";
import { useCompanyPropertyStore } from "@/store/companyproperty";
import React from "react";
import { MdDelete, MdEdit } from "react-icons/md";

const ProjectFAQs = () => {
    const {
        projects,
        selectedProjectIndex,
        projectDetails,
        addFaq,
        removeFaq,
        errors,
        setErrors,
        updateFaq
    } = useCompanyPropertyStore();

    const project = selectedProjectIndex !== null ? projects[selectedProjectIndex] : projectDetails;

    const [modalOpen, setModalOpen] = React.useState(false);
    const [question, setQuestion] = React.useState("");
    const [answer, setAnswer] = React.useState("");
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [editIndex, setEditIndex] = React.useState<number | null>(null);

    const validateForm = () => {
        const newErrors: any = {};
        if (!question.trim()) newErrors.question = "Question is required";
        if (!answer.trim()) newErrors.answer = "Answer is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = () => {
        if (!validateForm()) return;

        if (selectedProjectIndex !== null) {
            if (isEditMode && editIndex !== null) {
                updateFaq(selectedProjectIndex, editIndex, { question, answer });
            } else {
                addFaq(selectedProjectIndex, { question, answer });
            }
        }
        else if (project) {
            const updatedFaqs = [...project.faqs || []];

            if (isEditMode && editIndex !== null) {
                updatedFaqs.splice(editIndex, 1, { question, answer });
            }
            else {
                updatedFaqs.push({ question, answer });
            }
            useCompanyPropertyStore.setState({
                projectDetails: {
                    ...project,
                    faqs: updatedFaqs,
                },
            })
        }
        handleCancel();
    };


    const handleCancel = () => {
        setQuestion("");
        setAnswer("");
        setErrors({});
        setIsEditMode(false);
        setEditIndex(null);
        setModalOpen(false);
    };

    const handleEdit = (faq: { question: string; answer: string }, index: number) => {
        setQuestion(faq.question);
        setAnswer(faq.answer);
        setIsEditMode(true);
        setEditIndex(index);
        setModalOpen(true);
    };

    const renderFaqModal = () => {
        return (
            <Modal
                isOpen={modalOpen}
                closeModal={handleCancel}
                title={isEditMode ? "Edit FAQ" : "Add FAQ"}
                isCloseRequired={false}
                className="max-w-[300px] md:max-w-[700px]"
                rootCls=""
                titleCls="md:text-[24px] md:mb-5 text-[14px] font-medium text-center"
            >
                <div className="w-full flex flex-col gap-4">
                    <div className="flex flex-col md:gap-4">
                        <CustomInput
                            name="faq-question"
                            type="text"
                            required
                            label="Enter Most common question About Project"
                            placeholder="Enter Question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="px-2 py-1 border border-gray-200 rounded-md"
                            labelCls="md:text-[16px] text-[12px] font-medium"
                            errorMsg={errors.question}
                        />
                        <CustomInput
                            name="faq-answer"
                            type="textarea"
                            required
                            label="Enter answer to the question"
                            placeholder="Enter Answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="px-3 py-3 border border-gray-200 rounded-md text-[14px]"
                            labelCls="md:text-[16px] text-[12px]  font-medium"
                            errorMsg={errors.answer}
                        />
                    </div>
                    <div className="flex flex-row justify-center items-center gap-4 w-full">
                        <Button
                            className="border-[#3586FF] border-[1px] md:text-[16px] text-[12px]  text-black px-5 py-2 rounded-md font-medium"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-[#3586FF] text-white px-5 py-2 md:text-[16px] text-[12px]  rounded-md font-medium"
                            onClick={handleSubmit}
                        >
                            {isEditMode ? "Update" : "Submit"}
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    };

    return (
        <div className="relative flex flex-col gap-4   px-2 py-3">
            <div className="flex justify-between px-2 py-3">
                <p className="md:text-[18px] text-[16px] font-medium text-[#3586FF]">
                    FAQ's
                </p>
                <Button
                    className="bg-[#3586FF] md:text-[14px] text-[12px] text-white px-5 py-2 rounded-md font-medium"
                    onClick={() => {
                        setModalOpen(true);
                        setIsEditMode(false);
                        setQuestion("");
                        setAnswer("");
                    }}
                >
                    + Add FAQ
                </Button>
            </div>

            <div>
                {Array.isArray(project?.faqs) && project?.faqs?.length > 0 ? (
                    project?.faqs.map((faq, index) => (
                        <div key={index} className="flex flex-col gap-4 border-b border-gray-200 py-4">
                            <div className="flex justify-between flex-col md:flex-row gap-2 md:gap-0">
                                <div>
                                    <p className="font-medium md:text-[16px] text-[12px] text-gray-700">{`${(index + 1)}. ${(faq.question)}`}</p>
                                    <p className="font-medium md:text-[16px] text-[10px] text-gray-500">{faq.answer}</p>
                                </div>
                                {selectedProjectIndex !== null && (
                                    <div className="flex gap-3 items-center justify-center">
                                        <Button
                                            className="border-[1px] h-[30px] md:w-[40px] w-[30px] border-[#3586FF] text-blue md:px-4 px-2 py-1 rounded-md font-medium text-[#3586FF]"
                                            onClick={() => handleEdit(faq, index)}
                                        >
                                            <MdEdit size={16} />
                                        </Button>
                                        <Button
                                            className="border-[1px] h-[30px] md:w-[40px] w-[30px] bg-red-400 border-red-400  text-white md:px-4 px-2 py-1 rounded-md font-medium"
                                            onClick={() => removeFaq(selectedProjectIndex, index)}
                                        >
                                            <MdDelete />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-row justify-center items-center">
                        <p className="font-medium md:text-[18px] text-[14px] text-gray-500">No FAQs Found</p>
                    </div>
                )}
            </div>

            {renderFaqModal()}
        </div>
    );
};

export default ProjectFAQs;

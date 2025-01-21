import React, { useState, useRef, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { RxCross1 } from "react-icons/rx";
import { REACT_APP_IP } from "../../services/common";

const ImageScanner = () => {
  const [selection, setSelection] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);
  const [image, setImage] = useState(null);
  const [inputField, setInputField] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const [templateData, setTemplateData] = useState({
    name: "",
    other: "",
  });
  const [questionRange, setQuestionRange] = useState({
    min: "",
    max: "",
  });
  const token = JSON.parse(localStorage.getItem("userData"));
  const imageRef = useRef(null);
  const navigate = useNavigate();

  const imageURL = JSON.parse(localStorage.getItem("image"));

  useEffect(() => {
    setImage(imageURL);
  }, [imageURL]);

  // Function to handle mouse down event for drag selection
  const handleMouseDown = (e) => {
    const boundingRect = imageRef.current.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;
    setDragStart({ x: offsetX, y: offsetY });
  };

  // Function to handle mouse up event for drag selection
  const handleMouseUp = () => {
    if (dragStart) {
      setDragStart(null);
      setOpen(true);
      // Remove event listener for mousemove when dragging ends
    }
  };
  // Function to handle mouse move event for drag selection
  const handleMouseMove = (e) => {
    if (!e.buttons || !dragStart) {
      return;
    }
    const boundingRect = imageRef?.current.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;

    setSelection({
      coordinateX: Math.min(dragStart.x, offsetX),
      coordinateY: Math.min(dragStart.y, offsetY),
      width: Math.abs(offsetX - dragStart.x),
      height: Math.abs(offsetY - dragStart.y),
    });
  };

  const onResetHandler = () => {
    setDragStart(null);
    setSelection(null);
    setOpen(false);
  };

  // Function to submit drag selection and name of options like -> Roll Number , or Subject
  const onSelectedHandler = () => {
    if (!fieldType) {
      toast.error("Please select a field type.");
      return;
    }

    if (fieldType === "questionsField") {
      if (!questionRange || !questionRange.min || !questionRange.max) {
        toast.warning("Please ensure all fields are properly filled out.");
        return;
      }

      if (Number(questionRange.min) > Number(questionRange.max)) {
        toast.warning(
          "Please ensure the minimum value is always less than the maximum value."
        );
        return;
      }
    } else {
      if (fieldType === "formField" && inputField.includes("-")) {
        toast.error("Please refrain from using hyphens (-) in this field.");
        return;
      }

      if (!inputField) {
        toast.error("Please ensure to add the coordinate name.");
        return;
      }
    }

    const newObj = {
      ...selection,
      fieldType,
      id: Math.random().toString(),
      attribute:
        fieldType === "formField"
          ? inputField
          : questionRange.min + "--" + questionRange.max,
    };

    setSelectedCoordinates((prev) => [...prev, newObj]);
    setInputField("");
    setFieldType("");
    setOpen(false);
    setQuestionRange({
      min: "",
      max: "",
    });
    toast.success("Coordinate successfully added.");
  };

  const onRemoveSelectedHandler = (id) => {
    const newArray = selectedCoordinates.filter((data) => data.id !== id);
    setSelectedCoordinates(newArray);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (selectedCoordinates.length === 0) {
      toast.error("Please select the coordinates");
      return;
    }

    const data = {
      templateData: {
        name: templateData.name,
        other: templateData.other,
      },
      metaData: [...selectedCoordinates],
    };

    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/add/templete`,
        { data },
        {
          headers: {
            token: token,
          },
        }
      );
      toast.success("Template created successfully!");
      navigate("/imageuploader");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex scannerbg border-1 pt-16 ">
      {/* LEFT SECTION  */}
      <div className="flex w-[25%]">
        <div className="flex flex-1  flex-col justify-between border-e bg-teal-50">
          <div className="px-4 py-6">
            <div className="space-y-1">
              <div
                style={{ marginTop: "40px" }}
                className="block w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium  mb-5"
              >
                <div className="overflow-x-auto">
                  <div className="my-3 table-auto  border-collapse border border-gray-400 min-w-full divide-y-2 divide-gray-200 bg-white text-sm rounded-lg">
                    <div className="ltr:text-left rtl:text-right flex justify-around text-gray-600">
                      <div className="text-center whitespace-nowrap py-2">
                        Name
                      </div>
                      <div className="text-center whitespace-nowrap py-2">
                        Remove
                      </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {selectedCoordinates &&
                        selectedCoordinates?.map((data) => (
                          <div
                            key={data.id}
                            className="odd:bg-gray-50 flex justify-around"
                          >
                            <div className="whitespace-nowrap px-4 py-2 text-center font-semibold text-md text-gray-900 text-ellipsis w-[50%] overflow-x-hidden">
                              {data.attribute}
                            </div>
                            <div className="whitespace-nowrap px-4 py-2 text-center font-semibold text-md text-gray-900">
                              <MdDelete
                                onClick={() => onRemoveSelectedHandler(data.id)}
                                className="mx-auto text-red-500 text-xl"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {/* Form Field Area */}

                <div className=" bg-gradient-to-b from-white to-gray-100 rounded-3xl px-4 pt-1 pb-4 border-1 border-gray shadow-md mb-10">
                  <form onSubmit={onSubmitHandler}>
                    <input
                      required
                      className="input w-full font-semibold bg-white  border-none rounded-xl p-3 mt-6 shadow-xl   focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      type="text"
                      value={templateData.attribute}
                      onChange={(e) =>
                        setTemplateData({
                          ...templateData,
                          name: e.target.value,
                        })
                      }
                      placeholder="enter template name.."
                    />
                    <input
                      required
                      className="input w-full font-semibold bg-white border-none rounded-xl p-3 mt-6 shadow-xl   focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none focus:outline-none"
                      type="text"
                      value={templateData.other}
                      onChange={(e) =>
                        setTemplateData({
                          ...templateData,
                          other: e.target.value,
                        })
                      }
                      placeholder="enter other.."
                    />
                    <button className="ms-auto group  mt-4 flex items-center  rounded-lg bg-teal-600 hover:shadow-lg hover:shadow-blue-200  py-2 px-2 transition-colors hover:bg-teal-700 focus:outline-none focus:ring">
                      <span className="font-medium  flex text-white transition-colors group-hover:text-white  group-active:text-white mx-auto">
                        Save Template
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION  */}
      {!image ? (
        <div className="flex w--[75%] h-[100vh] justify-center items-center ">
          <div className="">
            <ImageNotFound />

            <h1 className="mt-8 text-2xl font-bold tracking-tight text-gray-700 sm:text-4xl">
              Please Select Image...
            </h1>

            <p className="mt-4 text-gray-600 text-center">
              We can't find that page!!
            </p>
          </div>
        </div>
      ) : (
        <div className=" pb-2 w-[75%] ">
          <div className="mx-auto max-w-screen-xl px-2 lg:pt-2 sm:px-6 lg:px-8">
            <div className="mt-2 flex justify-center pt-6 py-4">
              <div className="">
                {image && (
                  <div
                    style={{
                      position: "relative",
                      border: "1px solid purple",
                      height: "50rem",
                    }}
                    className="w-full overflow-y-auto"
                  >
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Selected"
                      style={{
                        width: "48rem",
                        // height: "50rem",
                        cursor: "crosshair",
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      draggable={false}
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    />
                    <>
                      {selectedCoordinates?.map((data, index) => (
                        <div
                          key={index}
                          className="border-blue-500"
                          style={{
                            border: "2px solid #007bff",
                            position: "absolute",
                            left: data.coordinateX,
                            top: data.coordinateY,
                            width: data.width,
                            height: data.height,
                          }}
                        ></div>
                      ))}
                      {selection && (
                        <div
                          className="border-blue-500"
                          style={{
                            border: "2px solid #007bff",
                            position: "absolute",
                            left: selection.coordinateX,
                            top: selection.coordinateY,
                            width: selection.width,
                            height: selection.height,
                          }}
                        ></div>
                      )}
                      <Transition.Root show={open} as={Fragment}>
                        <Dialog
                          as="div"
                          className="relative z-10"
                          initialFocus={cancelButtonRef}
                          onClose={setOpen}
                        >
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                          </Transition.Child>

                          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                              <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                              >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex w-full justify-between items-center">
                                        <div>
                                          <Dialog.Title
                                            as="h1"
                                            className="text-xl font-semibold leading-6 text-gray-900"
                                          >
                                            Add Field Entity..{" "}
                                          </Dialog.Title>
                                        </div>

                                        <div className="mt-2">
                                          <button
                                            type="button"
                                            className=" text-red-600 w-[30px] h-[30px]  text-xl"
                                            onClick={onResetHandler}
                                          >
                                            <RxCross1 className="font-extrabold" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-5 p-3 mt-3">
                                      <label
                                        htmlFor="formField"
                                        className="flex items-center font-semibold"
                                      >
                                        <input
                                          type="radio"
                                          id="formField"
                                          name="fieldType"
                                          value="formField"
                                          className="form-radio text-blue-500"
                                          required
                                          checked={fieldType === "formField"}
                                          onChange={(e) =>
                                            setFieldType(e.target.value)
                                          }
                                        />
                                        <span className="ml-2 text-lg text-gray-700">
                                          Form Field
                                        </span>
                                      </label>
                                      <label
                                        htmlFor="questionsField"
                                        className="flex items-center font-semibold"
                                      >
                                        <input
                                          type="radio"
                                          id="questionsField"
                                          name="fieldType"
                                          value="questionsField"
                                          className="form-radio text-blue-500"
                                          required
                                          checked={
                                            fieldType === "questionsField"
                                          }
                                          onChange={(e) =>
                                            setFieldType(e.target.value)
                                          }
                                        />
                                        <span className="ml-2 text-lg text-gray-700">
                                          Questions Field
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                  <div className=" px-4 pb-8 sm:flex sm:px-6 justify-between">
                                    {fieldType === "formField" ||
                                      fieldType === "" ? (
                                      <input
                                        required
                                        className="input w-[72%] border-2 font-semibold bg-white text-lg focus:border-1 rounded-xl px-3 py-2 shadow-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        type="text"
                                        name="field"
                                        placeholder="Field.."
                                        value={inputField}
                                        onChange={(e) =>
                                          setInputField(e.target.value)
                                        }
                                      />
                                    ) : (
                                      <div className="flex gap-5">
                                        <div className="flex items-center gap-4">
                                          <span className="font-bold">
                                            Start
                                          </span>
                                          <input
                                            type="number"
                                            id="Quantity"
                                            value={questionRange.min}
                                            onChange={(e) =>
                                              setQuestionRange({
                                                ...questionRange,
                                                min: e.target.value,
                                              })
                                            }
                                            className="h-10 w-16 rounded  border-2  border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                                          />
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <span className="font-bold">End</span>
                                          <input
                                            type="number"
                                            id="Quantity"
                                            value={questionRange.max}
                                            onChange={(e) =>
                                              setQuestionRange({
                                                ...questionRange,
                                                max: e.target.value,
                                              })
                                            }
                                            className="h-10 w-16 rounded  border-2  border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      data-bs-dismiss="modal"
                                      className="bg-teal-600 hover:bg-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-200  text-md font-medium px-3"
                                      onClick={onSelectedHandler}
                                    >
                                      Save Field
                                    </button>
                                  </div>
                                </Dialog.Panel>
                              </Transition.Child>
                            </div>
                          </div>
                        </Dialog>
                      </Transition.Root>
                    </>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageScanner;

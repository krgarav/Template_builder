import React, { useContext, useEffect, useState } from "react";
import { Modal, Button, Nav, Form, Tab, Row, Col } from "react-bootstrap";

import { useNavigate } from "react-router-dom";

import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-dropdowns/styles/material.css";
import { MultiSelect } from "react-multi-select-component";
import ImageSelection from "./imageSelection";
import { getScannedImage } from "helper/TemplateHelper";
import { toast } from "react-toastify";
import { fetchAllTemplate } from "helper/TemplateHelper";
import Select, { components } from "react-select";
import Imageswitch from "./Imageswitch";
import { change } from "@syncfusion/ej2-react-grids";
import { fetchAllUsers } from "helper/userManagment_helper";
import {
  fileType,
  imageTypeData,
  imageColorTypeData,
  imageDPIData,
  sensitivityType,
} from "data/helperData";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import { createJob } from "helper/job_helper";
import DirectoryPicker from "views/DirectoryPicker";
import ShadesOfGrey from "./shadesOfGrey";
import { Box, Slider } from "@mui/material";
import CustomTooltip from "components/CustomTooltip";
const JobModal = (props) => {
  const [modalShow, setModalShow] = useState(false);
  const [allTemplateOptions, setAllTemplateOptions] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState();
  const [fileNames, setFileNames] = useState([]);
  const [imageEnable, setImageEnable] = useState(false);
  const [allOperators, setAllOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [dataPath, setDataPath] = useState("");
  const [dataType, setDataType] = useState("");
  const [sensitivityValue, setSensitivityValue] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [imageType, setImageType] = useState("");
  const [imageDpi, setImageDpi] = useState("");
  const [imageColor, setImageColor] = useState("");
  const [selectedDataDirectory, setSelectedDataDirectory] = useState("");
  const [selectedSecondDataDirectory, setSelectedSecondDataDirectory] =
    useState("");
  const [selectedImageDirectory, setSelectedImageDirectory] = useState("");
  const [directoryPickerModal, setDirectoryPickerModal] = useState(false);
  const [jobName, setJobName] = useState("");
  const [dataName, setDataName] = useState("");
  const [secondDataName, setSecondDataName] = useState("");
  const [imageName, setImageName] = useState("");
  const [currentDirState, setCurrentDirState] = useState("data");
  const [showSecondSensitivity, setShowSecondSensitivity] = useState(false);
  const [sensitivity, setSensitivity] = useState(5);
  const [difference, setDifference] = useState(8);
  const [value, setValue] = React.useState([5, 8]);

  const changeHandler = (val) => {
    // if (!selectedDataDirectory && val === true) {
    //   toast.error("Please select data directory first");
    //   setImageEnable(false);
    //   return;
    // }
    setImageEnable(val);
  };
  useEffect(() => {
    if (props.show) {
      setModalShow(true);
    } else {
      setModalShow(false);
    }
  }, [props.show]);

  useEffect(() => {
    const getTemplates = async () => {
      const template = await fetchAllTemplate();
      const structuredTemplate = template?.map((item) => ({
        id: item.id,
        name: item.layoutName,
      }));

      setAllTemplateOptions(structuredTemplate);
    };
    getTemplates();
  }, []);

  useEffect(() => {
    const getUsers = async () => {
      const data = await fetchAllUsers();

      if (data?.success) {
        const structuredOperators = data.result
          .map((item) => {
            return { id: item.email, name: item.email };
          })
          .filter((item) => item !== null);
        setAllOperators(structuredOperators);
      }
      // const structuredTemplate = template.map((item) => ({ id: item.id, name: item.layoutName }))
      // console.log(structuredTemplate)
      // setAllTemplateOptions(structuredTemplate);
    };
    getUsers();
  }, []);

  const createTemplateHandler = async () => {
    if (!jobName) {
      toast.error("Please enter job name");
      return;
    }
    if (!selectedTemplate) {
      toast.error("Please select template");
      return;
    }
    // if (!sensitivityValue) {
    //   toast.error("Please select secondary sensitivity");
    //   return;
    // }
    // if (!selectedDataDirectory) {
    //   toast.error("Please select data directory");
    //   return;
    // }
    // if (!dataType) {
    //   toast.error("Please select data type");
    //   return;
    // }
    // if (!dataName) {
    //   toast.error("Please enter data name");
    //   return;
    // }
    // if (imageEnable) {
    //   if (!selectedImageDirectory) {
    //     toast.error("Please select image directory");
    //     return;
    //   }
    //   if (!imageType) {
    //     toast.error("Please select image type");
    //     return;
    //   }
    //   if (!imageDpi) {
    //     toast.error("Please select dpi");
    //     return;
    //   }
    //   if (!imageColor) {
    //     toast.error("Please select image color");
    //     return;
    //   }
    //   if (!imageName) {
    //     toast.error("Please enter image name");
    //     return;
    //   }
    // }

    const jobObj = {
      assignUser: "",
      templateId: selectedTemplate?.id,
      dataPath: selectedDataDirectory,
      dataType: dataType?.id,
      imagePath: selectedImageDirectory,
      imageType: imageType?.id,
      imageColor: imageColor?.id,
      jobStatus: "pending",
      jobName: jobName,
      imageName: imageName,
      dataFileName: dataName,
      secondSensitivity: +sensitivity || 0,
      secondDataPath: selectedSecondDataDirectory,
      secondDataFileName: secondDataName,
      entryAt: new Date().toISOString(),
    };
    const response = await createJob(jobObj);
    if (response?.success) {
      toast.success(response.message);
      props.onHide();
    }
  };
  const handleFileChange2 = (event) => {
    const files = Array.from(event.target.files);
    // setSelectedFiles(files);
    // For demonstration, log file names
    files.forEach((file) => console.log("Selected File:", file.name));
  };

  const directoryChangeHandler = (directory) => {
    directory = directory.substring(1);
    console.log(directory);
    // if (imageEnable) {
    //   setSelectedImageDirectory(directory);
    //   return;
    // }
    if (currentDirState === "image") {
      setSelectedImageDirectory(directory);
    } else if (currentDirState === "data2") {
      setSelectedSecondDataDirectory(directory);
    } else {
      setSelectedDataDirectory(directory);
    }
  };
  const secondarySensitivityHandler = (event) => {
    setShowSecondSensitivity(event.target.checked);
  };
  const getShadeFromValue = (value) => {
    // Example function to map slider value to a shade
    const shades = Array.from({ length: 16 }, (_, i) => {
      const greyValue = Math.floor(255 - i * (255 / 16));
      return `rgb(${greyValue}, ${greyValue}, ${greyValue})`;
    });
    const index = Math.floor((value[0] / 16) * shades.length);
    return shades[index] || shades[0];
  };
  const handleChange = (event, newValue, activeThumb) => {
    const minDistance = 1;
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      setValue([Math.min(newValue[0], value[1] - minDistance), value[1]]);
      setSensitivity(newValue[0]);
      setDifference(newValue[1]);
    } else {
      setValue([value[0], Math.max(newValue[1], value[0] + minDistance)]);
      setSensitivity(newValue[0]);
      setDifference(newValue[1]);
    }
  };
  return (
    <>
      <Modal
        show={modalShow}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="modal-custom-navbar"
        centered
        dialogClassName="modal-90w"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title id="modal-custom-navbar">Create Job</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ height: "65dvh", overflow: "auto" }}>
          <Row className="mb-3">
            <label
              htmlFor="example-text-input"
              className="col-md-2  col-form-label"
              style={{ fontSize: ".9rem" }}
            >
              Job Name:
            </label>
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                placeholder="Enter the Job name"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
              />
            </div>
          </Row>
          <Row className="mb-1">
            <label
              htmlFor="example-text-input"
              className="col-md-2 col-form-label "
              style={{ fontSize: ".9rem" }}
            >
              Select Template:
            </label>
            <div className="col-md-6 ">
              <Select
                value={selectedTemplate}
                onChange={(selectedValue) => setSelectedTemplate(selectedValue)}
                options={allTemplateOptions}
                getOptionLabel={(option) => option?.name || ""}
                getOptionValue={(option) => option?.id?.toString() || ""}
                placeholder="Select template..."
                className="mt-1"
              />
            </div>
            <label
              htmlFor="example-text-input"
              className="col-md-2"
              style={{ fontSize: ".9rem" }}
            >
              Secondary Sensitivity:
            </label>
            <div className="col-md-2 d-flex col-form-label ">
              <label className="custom-toggle  ">
                <input
                  type="checkbox"
                  checked={showSecondSensitivity}
                  onClick={secondarySensitivityHandler}
                />
                <span
                  className="custom-toggle-slider rounded-circle"
                  data-label-off="No"
                  data-label-on="Yes"
                ></span>
              </label>
            </div>
            {/* </div> */}
            {/* <div className="col-md-10">
              <label className="custom-toggle">
                <input type="checkbox" onClick={secondarySensitivityHandler} />
                <span
                  className="custom-toggle-slider rounded-circle"
                  data-label-off="No"
                  data-label-on="Yes"
                ></span>
              </label>
            </div> */}
          </Row>

          {showSecondSensitivity && (
            <Row className="mb-3">
              <label
                htmlFor="example-text-input"
                className="col-md-2  "
                style={{ fontSize: ".9rem" }}
              >
                Sensitivity Difference Value:
              </label>
              <div
                className="col-md-10"
                style={{
                  display: "flex",
                  gap: "5px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      borderRadius: "6px",
                      overflow: "hidden",
                      // width: "250%",
                    }}
                  >
                    <ShadesOfGrey width={"28px"} />
                  </div>
                  <Box
                    sx={{
                      width: "94%",
                      justifyContent: "center",
                      alignSelf: "center",
                    }}
                  >
                    <Slider
                      getAriaLabel={() => "Sensitivity range"}
                      value={value}
                      onChange={handleChange}
                      valueLabelDisplay="auto"
                      min={1}
                      max={16}
                      disableSwap
                      size="large"
                      color="PRIMARY"
                      slots={{
                        ValueLabel: (props) => (
                          <CustomTooltip
                            {...props}
                            shade={getShadeFromValue(value)} // Pass the shade based on the value
                          />
                        ),
                      }}
                    />
                  </Box>
                </div>

                <input
                  value={`${sensitivity} - ${difference}`}
                  onChange={(e) => setSensitivity(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "2px",
                    textAlign: "center",
                  }}
                  className="form-control"
                  type="text"
                  disabled
                />
              </div>
            </Row>
          )}

          {showSecondSensitivity && (
            <>
              <Row className="mb-2">
                <label
                  htmlFor="example-text-input"
                  className="col-md-2 col-form-label  "
                  style={{ fontSize: ".9rem" }}
                >
                  First Data File Name:
                </label>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter the name of data file"
                    value={dataName}
                    onChange={(e) => setDataName(e.target.value)}
                  />
                </div>
                <label
                  htmlFor="example-text-input"
                  className="col-md-2  "
                  style={{ fontSize: ".9rem" }}
                >
                  Second Data File Name:
                </label>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter the name of data file"
                    value={secondDataName}
                    onChange={(e) => setSecondDataName(e.target.value)}
                  />
                </div>
              </Row>
              <Row className="mb-3">
                <label
                  htmlFor="example-text-input"
                  className="col-md-2 "
                  style={{ fontSize: ".9rem" }}
                >
                  First Data Path:
                </label>

                {/* {selectedDataDirectory && ( */}
                <div className="col-md-4 d-flex ">
                  <input
                    // style={{ width: "70%" }}
                    type="text"
                    disabled
                    value={selectedDataDirectory}
                    className="form-control"
                    placeholder="No data path selected"
                    onChange={(e) => setDataPath(e.target.value)}
                  />
                  <Button
                    variant="info"
                    onClick={() => {
                      setCurrentDirState("data");
                      setDirectoryPickerModal(true);
                    }}
                    style={{ height: "85%" }}
                  >
                    Directory
                  </Button>
                </div>
                {/* )} */}

                <label
                  htmlFor="example-text-input"
                  className="col-md-2"
                  style={{ fontSize: ".9rem" }}
                >
                  Second Data Path:
                </label>
                {/* {selectedDataDirectory && ( */}
                <div className="col-md-4 d-flex">
                  <input
                    style={{ width: "70%" }}
                    type="text"
                    disabled
                    value={selectedSecondDataDirectory}
                    className="form-control"
                    placeholder="No data path selected"
                    ref={(input) => {
                      if (input) {
                        input.scrollLeft = input.scrollWidth; // Scroll to the end of the input
                      }
                    }}
                    // onChange={(e) => setDataPath(e.target.value)}
                  />
                  <Button
                    variant="info"
                    onClick={() => {
                      setCurrentDirState("data2");
                      setDirectoryPickerModal(true);
                    }}
                    style={{ height: "85%" }}
                  >
                    Directory
                  </Button>

                  {/* <button
                    onClick={() => {
                      setCurrentDirState("data2");
                      setDirectoryPickerModal(true);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.1rem 0.4rem",
                      backgroundColor: "#e5e7eb", // Tailwind's bg-gray-200
                      color: "#111827", // Tailwind's text-gray-900
                      borderRadius: "0.375rem", // Tailwind's rounded-md
                      border: "1px solid #d1d5db", // Tailwind's border-gray-300
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)", // Tailwind's shadow-sm
                      cursor: "pointer",
                      fontSize: "0.775rem", // Tailwind's text-sm
                      fontWeight: "500",
                      width:"30%",
                      transition: "all 0.2s ease-in-out",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#d1d5db"; // Tailwind's hover:bg-gray-300
                      e.target.style.borderColor = "#9ca3af"; // Tailwind's hover:border-gray-400
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "#e5e7eb"; // Reset to bg-gray-200
                      e.target.style.borderColor = "#d1d5db"; // Reset to border-gray-300
                    }}
                  >
                    Choose Directory
                  </button> */}
                </div>
                {/* )} */}
                {/* <div
                  className={selectedDataDirectory ? "col-md-3" : "col-md-4"}
                >
                  <Button
                    variant="info"
                    onClick={() => {
                      setCurrentDirState("data");
                      setDirectoryPickerModal(true);
                    }}
                  >
                    Choose Directory
                  </Button>
                </div> */}
              </Row>
            </>
          )}
          {/* <Row>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
              }}
            >
              <button
                // onClick={handleDirectoryChange}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#e5e7eb", // Tailwind's bg-gray-200
                  color: "#111827", // Tailwind's text-gray-900
                  borderRadius: "0.375rem", // Tailwind's rounded-md
                  border: "1px solid #d1d5db", // Tailwind's border-gray-300
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)", // Tailwind's shadow-sm
                  cursor: "pointer",
                  fontSize: "0.875rem", // Tailwind's text-sm
                  fontWeight: "500",
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#d1d5db"; // Tailwind's hover:bg-gray-300
                  e.target.style.borderColor = "#9ca3af"; // Tailwind's hover:border-gray-400
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#e5e7eb"; // Reset to bg-gray-200
                  e.target.style.borderColor = "#d1d5db"; // Reset to border-gray-300
                }}
              >
                Choose Directory
              </button>
              <input
                // value={directoryPath}
                readOnly
                style={{
                  flex: "1",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db", // Tailwind's border-gray-300
                  borderRadius: "0.5rem",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)", // Tailwind's shadow-sm
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                placeholder="Selected directory will appear here"
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6"; // Tailwind's focus:border-blue-500
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(59, 130, 246, 0.5)"; // Tailwind's focus:ring-2 focus:ring-blue-300
                }}
              />
            </div>
          </Row> */}
          {!showSecondSensitivity && (
            <>
              <Row className="mb-2">
                <label
                  htmlFor="example-text-input"
                  className="col-md-2 col-form-label "
                  style={{ fontSize: ".9rem" }}
                >
                  Data File Name :
                </label>
                <div className="col-md-10">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter the name of data file"
                    value={dataName}
                    onChange={(e) => setDataName(e.target.value)}
                  />
                </div>
              </Row>
              <Row className="mb-3">
                <label
                  htmlFor="example-text-input"
                  className="col-md-2  col-form-label"
                  style={{ fontSize: ".9rem" }}
                >
                  Data Path:
                </label>
                {/* {selectedDataDirectory && ( */}
                <div className="d-flex gap-2 col-md-10">
                  <input
                    style={{ width: "70%", marginRight: "2px" }}
                    type="text"
                    disabled
                    value={selectedDataDirectory}
                    className="form-control"
                    placeholder="No data path selected"
                    onChange={(e) => setDataPath(e.target.value)}
                  />
                  <Button
                    style={{ width: "30%" }}
                    variant="info"
                    onClick={() => {
                      setCurrentDirState("data");
                      setDirectoryPickerModal(true);
                    }}
                  >
                    Choose Directory
                  </Button>
                </div>
                {/* )} */}
                {/* <div
                  className={selectedDataDirectory ? "col-md-3" : "col-md-4"}
                >
                  <Button
                    variant="info"
                    onClick={() => {
                      setCurrentDirState("data");
                      setDirectoryPickerModal(true);
                    }}
                  >
                    Choose Directory
                  </Button>
                </div> */}
              </Row>
            </>
          )}
          <Row className="mb-2">
            <label
              htmlFor="example-text-input"
              className="col-md-2  col-form-label"
              style={{ fontSize: ".9rem" }}
            >
              Data Type:
            </label>
            <div className="col-md-10">
              <Select
                value={dataType}
                onChange={(selectedValue) => setDataType(selectedValue)}
                options={fileType}
                getOptionLabel={(option) => option?.name || ""}
                getOptionValue={(option) => option?.id?.toString() || ""}
                placeholder="Select file type..."
              />
            </div>
          </Row>
          <Row className="mb-3">
            <label
              htmlFor="example-text-input"
              className="col-md-3  col-form-label"
              style={{ fontSize: ".9rem" }}
            >
              IMAGE
            </label>
            <div className="col-md-9">
              <Imageswitch
                value={imageEnable}
                onChange={(val) => changeHandler(val)}
              />
              {/* <Select
                                value={colorType}
                                onChange={(selectedValue) =>
                                    setColorType(selectedValue)
                                }
                                options={colorTypeData}
                                getOptionLabel={(option) => option?.name || ""}
                                getOptionValue={(option) =>
                                    option?.id?.toString() || ""
                                }
                                placeholder="Select color type..."
                            /> */}
            </div>
          </Row>

          {imageEnable && (
            <>
              <Row className="mb-3">
                <label
                  htmlFor="example-text-input"
                  className="col-md-2  col-form-label"
                  style={{ fontSize: ".9rem" }}
                >
                  Image Path:
                </label>

                <div className="d-flex gap-2 col-md-10">
                  <input
                    style={{ width: "80%", marginRight: "2px" }}
                    type="text"
                    disabled
                    value={selectedImageDirectory}
                    className="form-control"
                    placeholder="No image path selected"
                    onChange={(e) => setDataPath(e.target.value)}
                  />
                  <Button
                    style={{ width: "20%" }}
                    variant="info"
                    onClick={() => {
                      setCurrentDirState("image");
                      setDirectoryPickerModal(true);
                    }}
                  >
                    Choose Directory
                  </Button>
                </div>
              </Row>
              <Row className="mb-2">
                <label
                  htmlFor="example-text-input"
                  className="col-md-2  col-form-label"
                  style={{ fontSize: ".9rem" }}
                >
                  Image Name:
                </label>
                <div className="col-md-10">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter the name of data file"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                  />
                </div>
              </Row>
              <Row className="mb-3">
                <label
                  htmlFor="example-text-input"
                  className="col-md-2  col-form-label"
                  style={{ fontSize: ".9rem" }}
                >
                  Image Type:
                </label>
                <div className="col-md-3">
                  <Select
                    value={imageType}
                    onChange={(selectedValue) => setImageType(selectedValue)}
                    options={imageTypeData}
                    getOptionLabel={(option) => option?.name || ""}
                    getOptionValue={(option) => option?.id?.toString() || ""}
                    placeholder="image type.."
                  />
                </div>

                <label
                  htmlFor="example-text-input"
                  className="col-md-1  col-form-label"
                  style={{ fontSize: ".9rem" }}
                >
                  DPI:
                </label>

                <div className="col-md-2">
                  <Select
                    value={imageDpi}
                    onChange={(selectedValue) => setImageDpi(selectedValue)}
                    options={imageDPIData}
                    getOptionLabel={(option) => option?.name || ""}
                    getOptionValue={(option) => option?.id?.toString() || ""}
                    placeholder="Dpi..."
                  />
                </div>
                <label
                  htmlFor="example-text-input"
                  className="col-md-1  col-form-label"
                  style={{ fontSize: ".9rem" }}
                >
                  Color:
                </label>
                <div className="col-md-3">
                  <Select
                    value={imageColor}
                    onChange={(selectedValue) => setImageColor(selectedValue)}
                    options={imageColorTypeData}
                    getOptionLabel={(option) => option?.name || ""}
                    getOptionValue={(option) => option?.id?.toString() || ""}
                    placeholder="Color type..."
                  />
                </div>
              </Row>
            </>
          )}
          {/* {imageEnable && <Row className="mb-3">
                            <label
                                htmlFor="example-text-input"
                                className="col-md-3  col-form-label"
                                style={{ fontSize: ".9rem" }}
                            >
                                Image DPI:
                            </label>

                            <div className="col-md-3">
                                <Select
                                    value={imageDpi}
                                    onChange={(selectedValue) =>
                                        setImageDpi(selectedValue)
                                    }
                                    options={imageDPIData}
                                    getOptionLabel={(option) => option?.name || ""}
                                    getOptionValue={(option) =>
                                        option?.id?.toString() || ""
                                    }
                                    placeholder="Select dpi..."
                                />
                            </div>
                            <label
                                htmlFor="example-text-input"
                                className="col-md-2  col-form-label"
                                style={{ fontSize: ".9rem" }}
                            >
                                Image Color:
                            </label>
                            <div className="col-md-4">
                                <Select
                                    value={selectedOperator}
                                    onChange={(selectedValue) =>
                                        setSelectedOperator(selectedValue)
                                    }
                                    options={imageColorTypeData}
                                    getOptionLabel={(option) => option?.name || ""}
                                    getOptionValue={(option) =>
                                        option?.id?.toString() || ""
                                    }
                                    placeholder="Select file type..."
                                />
                            </div>
                        </Row>} */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.onHide}>
            Close
          </Button>
          <Button variant="success" onClick={createTemplateHandler}>
            Add Job
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={directoryPickerModal}
        // onHide={props.onHide}
        size="lg"
        aria-labelledby="modal-custom-navbar"
        centered
        dialogClassName="modal-90w"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title id="modal-custom-navbar">Choose Directory</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ height: "65dvh" }}>
          <DirectoryPicker handleChange={directoryChangeHandler} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setDirectoryPickerModal(false);
            }}
          >
            Close
          </Button>
          {(selectedDataDirectory || selectedImageDirectory) && (
            <Button
              variant="success"
              onClick={() => {
                setDirectoryPickerModal(false);
              }}
            >
              Save Selected Directory
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default JobModal;

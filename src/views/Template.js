import {
  Card,
  CardHeader,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Table,
  Container,
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
import NormalHeader from "components/Headers/NormalHeader";
import { Modal, Button, Row, Col, Spinner } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataContext from "store/DataContext";
import axios from "axios";
import TemplateModal from "../modals/SimplexTemplateModal";
import { fetchAllTemplate } from "helper/TemplateHelper";
import { deleteTemplate } from "helper/TemplateHelper";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";
import { getTemplateImage } from "helper/TemplateHelper";
import { getTemplateCsv } from "helper/TemplateHelper";
import { getLayoutDataById } from "helper/TemplateHelper";
import Papa from "papaparse";
import { checkJobStatus } from "helper/TemplateHelper";
import Placeholder from "ui/Placeholder";
import CloneTemplateHandler from "services/CloneTemplate";
import BookletModal from "ui/BookletModal";
import { getUrls } from "helper/url_helper";

const Template = () => {
  const [modalShow, setModalShow] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [templateDatail, setTemplateDetail] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState(null);
  const navigate = useNavigate();
  const dataCtx = useContext(DataContext);

  useEffect(() => {
    sessionStorage.clear();
  }, []);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await getUrls();
  //       const GetDataURL = response.MAIN_URL;
  //       setBaseUrl(GetDataURL);
  //     } catch (error) {
  //       console.log("Error", error);
  //     }
  //   };
  //   fetchData();
  // }, []);
  // useEffect(() => {
  //   const fetchTemplates = async () => {
  //     try {
  //       setTemplateLoading(true);

  //       // Fetch all templates
  //       const templates = await fetchAllTemplate();
  //       if (!templates) {
  //         throw new Error("Error fetching templates");
  //       }

  //       // Transform the templates into the desired format
  //       const formattedTemplates = templates.map((item) => [
  //         { layoutParameters: item },
  //       ]);

  //       // Update the context with the formatted templates
  //       dataCtx.addToAllTemplate(formattedTemplates);
  //     } catch (error) {
  //       // Display an error toast if fetching templates fails
  //       toast.error(error.message || "Failed to fetch templates.");
  //     } finally {
  //       setTemplateLoading(false); // Ensure loading state is reset
  //     }
  //   };

  //   fetchTemplates();
  // }, [toggle]); // Re-run the effect when `toggle` changes

  const duplicateHandler = (arr) => {
    setShowDetailModal(true);
    setTemplateDetail(arr);
  };
  const cloneHandler = async (arr) => {
    // setShowDetailModal(false);
    console.log(templateDatail[0].layoutParameters.id);
    const temp = await CloneTemplateHandler(
      templateDatail[0].layoutParameters.id
    );

    if (temp === "Template Cloned Successfully") {
      toast.success(temp);
    } else {
      toast.error(temp);
    }
    setToggle((tg) => !tg);
    setShowDetailModal(false);
  };
  const handleRowClick = (rowData, index) => {};

  const editHandler = async (arr, index) => {
    try {
      setLoading(true);

      const tempData = arr[0]?.layoutParameters;
      if (!tempData) {
        throw new Error("Invalid template data. Cannot proceed.");
      }

      const templateId = tempData.id;
      const res = await getLayoutDataById(templateId);

   
      const { csvPath, imagePaths } = res;

      if (!csvPath) {
        toast.error("No CSV found in this template. Cannot open the template.");
        return;
      }

      if (!imagePaths) {
        toast.error(
          "No images found in this template. Cannot open the template."
        );
        return;
      }

      const csvData = await getTemplateCsv(csvPath);
      console.log(arr);

      if (arr[0].layoutParameters.isBooklet) {
        navigate("/admin/template/booklet/edit-design-template", {
          state: {
            templateIndex: index,
            timingMarks: +tempData.timingMarks,
            totalColumns: +tempData.totalColumns,
            bubbleType: tempData.bubbleType,
            templateId: tempData.id,
            excelJsonFile: csvData.data,
            images: imagePaths,
          },
        });
      } else {
        // navigate("/admin/template/edit-template", {
        //   state: {
        //     templateIndex: index,
        //     timingMarks: +tempData.timingMarks,
        //     totalColumns: +tempData.totalColumns,
        //     bubbleType: tempData.bubbleType,
        //     templateId: tempData.id,
        //     excelJsonFile: csvData.data,
        //     images: imagePaths,
        //   },
        // });
      }
    } catch (error) {
      // toast.error("An error occurred. Cannot open the template.");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageUrl) => {
    const cloudName = process.env.REACT_APP_CLOUD_NAME; // Your Cloudinary cloud name
    const apiKey = process.env.REACT_APP_API_KEY; // Your Cloudinary API key
    const apiSecret = process.env.REACT_APP_API_SECRET; // Your Cloudinary API secret

    // Extract public ID from URL
    const urlParts = imageUrl.split("/");
    const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));
    const publicIdWithFormat = urlParts.slice(versionIndex + 1).join("/"); // omrimages/dj7va6r3farwpblq6txv.jpg
    const publicId = publicIdWithFormat.split(".")[0]; // omrimages/dj7va6r3farwpblq6txv

    console.log("Extracted public ID:", publicId); // Debugging: Log the public ID

    // Create the timestamp and signature
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = CryptoJS.SHA1(stringToSign).toString();

    // Form data for the request
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("timestamp", timestamp);
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    try {
      // Make the API request to delete the image
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data); // Debugging: Log the response data

      return response.data;
    } catch (error) {
      console.error("Error deleting image:", error); // Debugging: Log any error
      throw error;
    }
  };

  const deleteHandler = async (arr, index) => {
    const result = window.confirm("Are you sure you want to delete template ?");
    if (result) {
      const id = arr[0].layoutParameters.id;
      // const imageUrl = arr[0].layoutParameters.templateImagePath;
      // const result = await deleteImage(imageUrl);
      const responseJob = await checkJobStatus(id);
      console.log(responseJob);
      // return;
      if (responseJob.success) {
        const result = window.confirm(
          "Job already created by this template.Do you still want to delete Template?"
        );
        if (!result) {
          return;
        }
      }

      const res = await deleteTemplate(id);
      if (res?.success) {
        setToggle((prev) => !prev);
        toast.success("Successfully deleted template");
      }

      // dataCtx.deleteTemplate(index)
    } else {
      return;
    }
  };
  const placeHolderJobs = new Array(10).fill(null).map((_, index) => (
    <tr key={index}>
      <td>
        <Placeholder width="20%" height="1.5em" />
      </td>
      <td>
        <Placeholder width="60%" height="1.5em" />
      </td>
      <td>
        <Placeholder width="60%" height="1.5em" />
      </td>
      <td>
        <Placeholder width="60%" height="1.5em" />
      </td>
      <td>
        <Placeholder width="60%" height="1.5em" />
      </td>
      <td></td>
    </tr>
  ));
  const LoadedTemplates = dataCtx.allTemplates?.map((d, i) => (
    <tr
      key={i}
      onClick={() => handleRowClick(d, i)}
      style={{ cursor: "pointer" }} // Adds a pointer cursor on hover
    >
      <td>{i + 1}</td>
      <td>{d[0].layoutParameters.layoutName}</td>
      <td>{d[0].layoutParameters.timingMarks}</td>
      <td>{d[0].layoutParameters.totalColumns}</td>
      <td>{d[0].layoutParameters["bubbleType"]}</td>
      <td>{d[0].layoutParameters["isBooklet"] ? "Duplex" : "Simplex"}</td>
      <td className="text-right">
        <UncontrolledDropdown>
          <DropdownToggle
            className="btn-icon-only text-light"
            href="#pablo"
            role="button"
            size="sm"
            color=""
            onClick={(e) => e.preventDefault()}
          >
            <i className="fas fa-ellipsis-v" />
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-arrow" right>
            <DropdownItem onClick={() => editHandler(d, i)}>Edit</DropdownItem>
            <DropdownItem onClick={() => duplicateHandler(d)}>
              Duplicate
            </DropdownItem>
            <DropdownItem
              style={{ color: "red" }}
              onClick={() => deleteHandler(d, i)}
            >
              Delete
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </td>
    </tr>
  ));

  return (
    <>
      <NormalHeader />
      {/* Page content */}
     
      {/* Template Detail Modal*/}
      {templateDatail.length !== 0 && (
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          size="lg"
          aria-labelledby="modal-custom-navbar"
          centered
        >
          <Modal.Header>
            <Modal.Title id="modal-custom-navbar">
              Template Name : {templateDatail[0].layoutParameters.layoutName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Col xs={12} md={2}>
                <label
                  htmlFor="example-text-input"
                  style={{ fontSize: ".9rem" }}
                >
                  Name:
                </label>
              </Col>
              <Col xs={12} md={10}>
                <input
                  type="text"
                  className="form-control"
                  value={templateDatail[0].layoutParameters.layoutName}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12} md={2}>
                <label
                  htmlFor="example-text-input"
                  style={{ fontSize: ".9rem" }}
                >
                  Total Row:
                </label>
              </Col>
              <Col xs={12} md={2}>
                <input
                  type="text"
                  className="form-control"
                  value={templateDatail[0].layoutParameters.timingMarks}
                  readOnly
                />
              </Col>
              <Col xs={12} md={2}>
                <label
                  htmlFor="example-text-input"
                  style={{ fontSize: ".9rem" }}
                >
                  Total Column:
                </label>
              </Col>
              <Col xs={12} md={2}>
                <input
                  type="text"
                  className="form-control"
                  value={templateDatail[0].layoutParameters.totalColumns}
                  readOnly
                />
              </Col>
              <Col xs={12} md={2}>
                <label
                  htmlFor="example-text-input"
                  style={{ fontSize: ".9rem" }}
                >
                  Bubble Type:
                </label>
              </Col>

              <Col xs={12} md={2}>
                <input
                  type="text"
                  className="form-control"
                  value={templateDatail[0].layoutParameters.bubbleType}
                  readOnly
                />
              </Col>
            </Row>

            {templateDatail.Regions &&
              templateDatail.Regions.map((item, index) => {
                return (
                  <div key={index}>
                    <Row className="mb-3">
                      <Col xs={12} md={2}>
                        <label
                          htmlFor="example-text-input"
                          style={{ fontSize: ".9rem" }}
                        >
                          Region Name:
                        </label>
                      </Col>
                      <Col xs={12} md={10}>
                        <input
                          type="text"
                          className="form-control"
                          value={item["Region name"]}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col xs={6} md={3}>
                        <label
                          htmlFor="example-text-input"
                          style={{ fontSize: ".9rem" }}
                        >
                          Start Row:
                        </label>
                        <input
                          className="form-control"
                          value={item["Coordinate"]["Start Row"]}
                          readOnly
                        />
                      </Col>
                      <Col xs={6} md={3}>
                        <label
                          htmlFor="example-text-input"
                          style={{ fontSize: ".9rem" }}
                        >
                          Start Col:
                        </label>
                        <input
                          className="form-control"
                          value={item["Coordinate"]["Start Col"]}
                          readOnly
                        />
                      </Col>
                      <Col xs={6} md={3}>
                        <label
                          htmlFor="example-text-input"
                          style={{ fontSize: ".9rem" }}
                        >
                          End Row:
                        </label>
                        <input
                          className="form-control"
                          value={item["Coordinate"]["End Row"]}
                          readOnly
                        />
                      </Col>
                      <Col xs={6} md={3}>
                        <label
                          htmlFor="example-text-input"
                          style={{ fontSize: ".9rem" }}
                        >
                          End Col:
                        </label>
                        <input
                          className="form-control"
                          value={item["Coordinate"]["End Col"]}
                          readOnly
                        />
                      </Col>
                    </Row>
                  </div>
                );
              })}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDetailModal(false)}
            >
              Close
            </Button>
            <Button variant="success" onClick={cloneHandler}>
              Clone Template
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {/* <TemplateModal show={modalShow} onHide={() => setModalShow(false)} />{" "} */}
      {/* Create Template modal */}
      <BookletModal show={true} />
    </>
  );
};

export default Template;

import React, { useContext, useEffect, useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Row } from "reactstrap";
import { Modal, Button, Col } from "react-bootstrap";
import Select, { components } from "react-select";
import {
  Card,
  CardHeader,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Table,
} from "reactstrap";
import classes from "./ImageCropper.module.css";
import { toast } from "react-toastify";
import DataContext from "store/DataContext";
import { getUrls } from "helper/url_helper";
import { sideOption } from "data/helperData";
const ImagesCropper = ({ images, handleImage, selectedCoordinateData }) => {
  const dataCtx = useContext(DataContext);
  const cropperRef = useRef(null);
  const [cropData, setCropData] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [allImages, setAllImages] = useState([]);
  const [imageName, setImageName] = useState("");
  const [croppingSide, setCroppingSide] = useState("frontSide");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(null);
  const [show, setShow] = useState(false);
  const [options, setOptions] = useState([]);
  const [prefix, setPrefix] = useState("");
  const [baseUrl, setBaseUrl] = useState(null);
  const [side, setSide] = useState(sideOption[0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUrls();
        const GetDataURL = response.MAIN_URL;
        setBaseUrl(GetDataURL);
      } catch (error) {
        console.log("Error", error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const coordinateOptns = selectedCoordinateData.map((item) => {
      return { id: item.name, label: item.name };
    });
    setOptions(coordinateOptns);
  }, [selectedCoordinateData]);
  useEffect(() => {
    const templateIndex = JSON.parse(localStorage.getItem("Template"))[0]
      .layoutParameters.key;

    const currentTemplate = dataCtx.allTemplates.find((item) => {
      return item[0].layoutParameters?.key ?? "" === templateIndex;
    });

    const imageCoordinate = currentTemplate[0].imageCroppingDTO ?? [];

    setAllImages(imageCoordinate);
  }, [dataCtx.allTemplates]);

  useEffect(() => {
    const templateIndex = JSON.parse(localStorage.getItem("Template"))[0]
      .layoutParameters.key;
    if (allImages.length > 0) {
      dataCtx.addImageCoordinate(templateIndex, allImages);
    }
  }, [allImages]);
  useEffect(() => {
    if (!modalShow) {
      document.body.classList.add(classes["blur-background"]);
    } else {
      document.body.classList.remove(classes["blur-background"]);
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove(classes["blur-background"]);
    };
  }, [modalShow]);
  useEffect(() => {
    handleImage(allImages);
  }, [allImages]);

  const getCropData = () => {
    const cropper = cropperRef.current.cropper;
    const cropBoxData = cropper.getCropBoxData();
    const imageData = cropper.getImageData();
    const canvasData = cropper.getCanvasData();
    // Calculate coordinates relative to the original image
    const scaleX = imageData.naturalWidth / imageData.width;
    const scaleY = imageData.naturalHeight / imageData.height;

    const coordinates = {
      startX: (cropBoxData.left - canvasData.left) * scaleX,
      startY: (cropBoxData.top - canvasData.top) * scaleY,
      endX: (cropBoxData.left - canvasData.left + cropBoxData.width) * scaleX,
      endY: (cropBoxData.top - canvasData.top + cropBoxData.height) * scaleY,
    };

    const relativeCoordinates = {
      TopLeftX: cropBoxData.left - canvasData.left,
      TopLeftY: cropBoxData.top - canvasData.top,
      BottomRightX: cropBoxData.left - canvasData.left + cropBoxData.width,
      BottomRightY: cropBoxData.top - canvasData.top + cropBoxData.height,
    };

    setCropData({
      coordinates,
      relativeCoordinates,
      croppedImage: cropper.getCroppedCanvas().toDataURL(),
    });
  };
  const saveHandler2 = () => {
    const template = localStorage.getItem("Template");
    console.log(template);
    // dataCtx.addImageCoordinate()
  };
  const saveHandler = () => {
    const cropCoordinate = cropData.coordinates;

    const {
      startX: rawTopLeftX,
      startY: rawTopRightY,
      endX: rawBottomLeftX,
      endY: rawBottomRightY,
    } = cropCoordinate;

    const topLeftX = Math.floor(rawTopLeftX);
    const topLeftY = Math.floor(rawTopRightY);
    const bottomRightX = Math.floor(rawBottomLeftX);
    const bottomRightY = Math.floor(rawBottomRightY);
    const obj = {
      // key: uuidv4(),
      imageName: imageName,
      croppingSide: croppingSide,
      topLeftX,
      topLeftY,
      bottomRightX,
      bottomRightY,
    };
    console.log(obj);
    setAllImages((prevData) => {
      const updatedData = [...prevData, obj];
      return updatedData;
    });
    // setModalShow(false)
  };
  const editHandler = () => {};

  const deleteHandler = (index) => {
    console.log(index);
    setAllImages((prevData) => {
      const updatedData = prevData.filter((_, i) => i !== index);
      return updatedData;
    });
  };

  const saveRegionHandler = () => {
    if (!imageName) {
      toast.error("Image Name cannot be empty");
      return;
    }

    saveHandler();
    setShow(false);
    setImageName("");
    setCroppingSide("");
  };

  const prevHandler = () => {
    const toastId = "firstPageWarning";
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      toast.warn("You are already on the first page!", { toastId });
    }
  };
  const nextHandler = () => {
    const toastId = "lastPageWarning";
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      toast.warn("last page reached", { toastId });
    }
  };
  const allData = allImages.map((item, index) => {
    return (
      <>
        <tr
          key={index}
          // onClick={() => handleRowClick(d, i)}
          style={{ cursor: "pointer" }} // Adds a pointer cursor on hover
        >
          <td>{index + 1}</td>
          <td>{item.imageName}</td>
          <td>{item.croppingSide}</td>
          <td>
            {" "}
            TopLeftX={Math.floor(item.topLeftX)}&nbsp; TopLeftY=
            {Math.floor(item.topLeftY)}
            <br />
            BottomRightX={Math.floor(item.bottomRightX)}&nbsp; BottomRightY=
            {Math.floor(item.bottomRightY)}
          </td>
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
                <DropdownItem onClick={() => editHandler(index)}>
                  Edit
                </DropdownItem>
                <DropdownItem
                  style={{ color: "red" }}
                  onClick={() => deleteHandler(index)}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </td>
        </tr>
      </>
    );
  });

  return (
    <>
      <Card className="shadow">
        <CardHeader className="border-0">
          <div className="d-flex justify-content-between">
            <h3 className="mt-2">Images</h3>

            <Button
              className=""
              color="primary"
              type="button"
              onClick={() => setShow(true)}
            >
              Select Image
            </Button>
          </div>
        </CardHeader>
        <div>
          <Table className="align-items-center table-flush mb-5" responsive>
            <thead className="thead-light">
              <tr>
                <th scope="col" className="text-center">
                  SL no.
                </th>
                <th scope="col" className="text-center">
                  Image Name
                </th>
                <th scope="col" className="text-center">
                  Cropping Area
                </th>
                <th scope="col" className="text-center">
                  Coordinate
                </th>
                <th scope="col" className="text-center"></th>
              </tr>
            </thead>
            <tbody style={{ textAlign: "center" }}>
              {allData.length > 0 ? (
                allData
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No image selected
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
      {/* ****************** modal for showing cropping images *************** */}
      <Modal
        show={show}
        fullscreen={true}
        size="xl"
        onHide={() => setShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              display: "flex",
              width: "80%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Row md={12} style={{ width: "100%" }}>
              <Col md={6}>
                <div className="d-flex align-items-center w-100 ">
                  <label htmlFor="prefixName" className="form-label mr-2">
                    Prefix:
                  </label>
                  <Select
                    value={prefix}
                    onChange={(selectedValue) => setPrefix(selectedValue)}
                    options={options}
                    getOptionLabel={(option) => option?.label || ""}
                    getOptionValue={(option) => option?.id?.toString() || ""}
                    placeholder="Select Prefix..."
                    className="w-100"
                  />
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-center">
                  <label htmlFor="imageName" className="form-label">
                    Image Name :
                  </label>
                  <input
                    id="imageName"
                    type="text"
                    placeholder="Enter Image Name"
                    className="form-control"
                    onChange={(e) => setImageName(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </Col>
            </Row>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ width: "100%", height: "65dvh", overflow: "auto" }}
        >
          <div className="d-flex flex-row align-items-center">
            <div className="d-flex align-items-center w-10 ">
              <label htmlFor="prefixName" className="form-label mr-2">
                Side:
              </label>
              <Select
                value={side}
                onChange={(selectedValue) => setSide(selectedValue)}
                options={sideOption}
                getOptionLabel={(option) => option?.name || ""}
                getOptionValue={(option) => option?.id?.toString() || ""}
                placeholder="Select side..."
                className="w-100"
              />
            </div>
            <div className="d-flex justify-content-center flex-grow-1">
              <Button
                // active={currentImage === imageSrc}
                onClick={prevHandler}
              >
                Prev
              </Button>
              <Button
                // active={currentImage === backImageSrc}
                onClick={nextHandler}
              >
                Next
              </Button>
            </div>
          </div>
          <div className="border border-primary">
            <Cropper
              src={
                side.name === "Front"
                  ? `${baseUrl}GetTemplateImage?filePath=${images[currentImageIndex].frontImagePath}`
                  : `${baseUrl}GetTemplateImage?filePath=${images[currentImageIndex].backImagePath}`
              }
              style={{ height: "50dvh", width: "100%" }}
              initialAspectRatio={1}
              guides={true}
              ref={cropperRef}
              cropend={() => getCropData()}
              viewMode={1}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={true}
              responsive={true}
              autoCropArea={0}
              checkOrientation={false}
              rotatable={true}
              autoCrop={false}
            />
          </div>
          <div
            className="mb-2"
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          ></div>
          <br />
          <br />
          {cropData && (
            <Row className="">
              <div
                className="col-12"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                <img
                  src={cropData.croppedImage}
                  alt="Cropped"
                  className="img-fluid"
                  style={{ width: 500, height: 200 }}
                />
              </div>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="danger"
            onClick={() => setShow(false)}
            className="waves-effect waves-light"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={saveRegionHandler}
            // onClick={() => setShow(false)}
            className="waves-effect waves-light"
          >
            Save Selected area
          </Button>
        </Modal.Footer>
      </Modal>
      {/* ******************************************************************** */}
    </>
  );
};

export default ImagesCropper;

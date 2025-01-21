import Header from "components/Headers/Header.js";
import NormalHeader from "components/Headers/NormalHeader";
import { Modal } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { fetchProcessData } from "helper/Booklet32Page_helper";
import { toast } from "react-toastify";
import { Button, Card, CardHeader, Container, Row, Table } from "reactstrap";
import { refreshScanner } from "helper/Booklet32Page_helper";
import { scanFiles } from "helper/Booklet32Page_helper";
// import { GridComponent, ColumnsDirective, ColumnDirective, Sort, Inject, Toolbar, Page, Filter, Edit } from '@syncfusion/ej2-react-grids';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Sort,
  Inject,
  Toolbar,
  Filter,
} from "@syncfusion/ej2-react-grids";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";
import { cancelScan } from "helper/TemplateHelper";
import { finishJob } from "helper/job_helper";
import axios from "axios";
import { getUrls } from "helper/url_helper";
import PrintModal from "ui/PrintModal";
import { VirtualScroll } from "@syncfusion/ej2-grids";
import { getTotalExcellRow } from "helper/Booklet32Page_helper";
import { getDataByRowRange } from "helper/Booklet32Page_helper";
import getSocketBaseUrl from "services/getSocketApi";
import DualJsonData from "data/dualJsonData";
import splitOddEven from "services/OddEvenSplit";
function emptyMessageTemplate() {
  return (
    <div className="text-center">
      <img
        src={"/emptyRecordTemplate_light.svg"}
        className="d-block mx-auto my-2"
        alt="No record"
      />
      <span>There is no data available to display at the moment.</span>
    </div>
  );
}
let num = JSON.parse(localStorage.getItem("lastSerialNo"), 10) || 1;
const AdminScanJob = () => {
  const [count, setCount] = useState(true);
  const [processedData, setProcessedData] = useState([]);
  const [secondProcessedData, setSecondProcessedData] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [headData, setHeadData] = useState(["Student Data"]);
  const filterSettings = { type: "Excel" };
  // const toolbar = ['Add', 'Edit', 'Delete', 'Update', 'Cancel', 'ExcelExport', 'CsvExport'];
  const editSettings = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
  };
  const [items, setItems] = useState([]);
  const [selectedValue, setSelectedValue] = useState();
  const [toolbar, setToolbar] = useState(["ExcelExport", "CsvExport"]);
  const [services, setServices] = useState([Sort, Toolbar, Filter]);
  const [gridHeight, setGridHeight] = useState("850px");
  const [starting, setStarting] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 576);
  const [proccessUrl, setProcessURL] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(true);
  const [templateName, setTemplateName] = useState("");
  const [scrollState, setScrollState] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [lastSerialNo, setLastSerialNo] = useState(null);
  const [socketBaseUrl, setSocketBaseUrl] = useState(null);
  const [isSecondSensitivity, setIsSecondSensitivity] = useState(false);
  const template = emptyMessageTemplate;
  const location = useLocation();

  const serialRef = useRef();
  const gridRef = useRef();

  const navigate = useNavigate();

  // useEffect(() => {
  //   const { oddData, evenData } = splitOddEven(DualJsonData.Data);
  //   let evenSerialNo = num;
  //   const updateEvenDatas = evenData.map((row) => {
  //     const flattenedRow = {};
  //     const mismatchData = {};

  //     Object.keys(row).forEach((key) => {
  //       flattenedRow[key] = row[key].Value; // Add the value to the flattened row
  //       mismatchData[key] = row[key].Mismatch; // Keep mismatch information
  //     });

  //     flattenedRow.MismatchData = mismatchData; // Add mismatch info as a separate field
  //     return flattenedRow;
  //   });
  //   if (updateEvenDatas.length !== 0) {
  //     const newDataKeys = Object.keys(updateEvenDatas[0])
  //       .filter((key) => key !== "MismatchData") // Exclude 'MismatchData' key
  //       .map((key) => {
  //         return key.endsWith(".") ? key.slice(0, -1) : key; // Remove trailing '.'
  //       });
  //     setHeadData(["Serial No", ...newDataKeys]);

  //     let updatedData = updateEvenDatas.map((item) => {
  //       const newItem = {};
  //       for (const key in item) {
  //         const newKey = key.endsWith(".") ? key.slice(0, -1) : key;
  //         newItem[newKey] = item[key];
  //       }
  //       newItem["Serial No"] = evenSerialNo++;
  //       return newItem;
  //     });

  //     setSecondProcessedData((prevData) => {
  //       const combinedData = [...prevData, ...updatedData];
  //       const lastSlNo = combinedData[combinedData.length - 1]["Serial No"];
  //       setLastSerialNo(lastSlNo);
  //       if (combinedData.length > 100) {
  //         return combinedData.slice(-100);
  //       }
  //       return combinedData;
  //     });
  //     if (gridRef) {
  //       gridRef?.current?.refresh();
  //     }
  //   }

  //   const updatedOddDatas = oddData.map((row) => {
  //     const flattenedRow = {};
  //     const mismatchData = {};

  //     Object.keys(row).forEach((key) => {
  //       flattenedRow[key] = row[key].Value; // Add the value to the flattened row
  //       mismatchData[key] = row[key].Mismatch; // Keep mismatch information
  //     });

  //     flattenedRow.MismatchData = mismatchData; // Add mismatch info as a separate field
  //     return flattenedRow;
  //   });

  //   let oddSerialNo = num;
  //   if (updatedOddDatas.length !== 0) {
  //     const newDataKeys = Object.keys(updatedOddDatas[0])
  //       .filter((key) => key !== "MismatchData") // Exclude 'MismatchData' key
  //       .map((key) => {
  //         return key.endsWith(".") ? key.slice(0, -1) : key; // Remove trailing '.'
  //       });
  //     setHeadData(["Serial No", ...newDataKeys]);

  //     let updatedData = updatedOddDatas.map((item) => {
  //       const newItem = {};
  //       for (const key in item) {
  //         const newKey = key.endsWith(".") ? key.slice(0, -1) : key;
  //         newItem[newKey] = item[key];
  //       }
  //       newItem["Serial No"] = oddSerialNo++;
  //       return newItem;
  //     });

  //     setProcessedData((prevData) => {
  //       const combinedData = [...prevData, ...updatedData];
  //       const lastSlNo = combinedData[combinedData.length - 1]["Serial No"];
  //       setLastSerialNo(lastSlNo);
  //       if (combinedData.length > 100) {
  //         return combinedData.slice(-100);
  //       }
  //       return combinedData;
  //     });
  //     if (gridRef) {
  //       gridRef?.current?.refresh();
  //     }
  //   }

  //   num = num + 1; // Increment the number for the next iteration
  // }, []);
  // console.log(processedData);
  // useEffect(() => {
  //   if (lastSerialNo) {
  //     localStorage.setItem("lastSerialNo", JSON.stringify(lastSerialNo));
  //   }
  // }, [lastSerialNo]);
  useEffect(() => {
    const response = async () => {
      const urls = await getSocketBaseUrl();
      setSocketBaseUrl(urls);
    };
    response();
  }, []);
  useEffect(() => {
    if (socketBaseUrl) {
      // Create a WebSocket connection
      const token = localStorage.getItem("token");
      const userInfo = jwtDecode(token);
      const userId = userInfo.UserId;
      const localTemplateId = localStorage.getItem("scantemplateId");
      const secondSensitivity = localStorage.getItem("secondSensitivity");
      const socket = new WebSocket(
        `${socketBaseUrl}ProcessData?id=${localTemplateId}&userId=${userId}`
      );
      // Event listener for when the WebSocket connection is open
      socket.onopen = () => {
        console.log("WebSocket connection established.");
      };

      // Event listener for when a message is received
      socket.onmessage = (event) => {
        // console.log(event.data);
        // console.log(typeof secondSensitivity);
        if (secondSensitivity === "0") {
          console.log(event.data);
          if (event.data) {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data?.Data) {
              if (data.Data.length !== 0) {
                const newDataKeys = Object.keys(data.Data[0]).map((key) => {
                  return key.endsWith(".") ? key.slice(0, -1) : key;
                });
                setHeadData(["Serial No", ...newDataKeys]);

                let updatedData = data.Data.map((item) => {
                  const newItem = {};
                  for (const key in item) {
                    const newKey = key.endsWith(".") ? key.slice(0, -1) : key;
                    newItem[newKey] = item[key];
                  }
                  newItem["Serial No"] = num++;
                  return newItem;
                });

                setProcessedData((prevData) => {
                  const combinedData = [...prevData, ...updatedData];
                  const lastSlNo =
                    combinedData[combinedData.length - 1]["Serial No"];
                  setLastSerialNo(lastSlNo);
                  if (combinedData.length > 100) {
                    return combinedData.slice(-100);
                  }
                  return combinedData;
                });
                if (gridRef) {
                  gridRef?.current?.refresh();
                }
              }
            }
          }
        } else {
          if (event.data) {
            const data = JSON.parse(event.data);
            if (data?.Data) {
              if (data.Data.length !== 0) {
                const { oddData, evenData } = splitOddEven(data.Data);
                let evenSerialNo = num;
                const updateEvenDatas = evenData.map((row) => {
                  const flattenedRow = {};
                  const mismatchData = {};

                  Object.keys(row).forEach((key) => {
                    flattenedRow[key] = row[key].Value; // Add the value to the flattened row
                    mismatchData[key] = row[key].Mismatch; // Keep mismatch information
                  });

                  flattenedRow.MismatchData = mismatchData; // Add mismatch info as a separate field
                  return flattenedRow;
                });
                if (updateEvenDatas.length !== 0) {
                  const newDataKeys = Object.keys(updateEvenDatas[0])
                    .filter((key) => key !== "MismatchData") // Exclude 'MismatchData' key
                    .map((key) => {
                      return key.endsWith(".") ? key.slice(0, -1) : key; // Remove trailing '.'
                    });
                  setHeadData(["Serial No", ...newDataKeys]);

                  let updatedData = updateEvenDatas.map((item) => {
                    const newItem = {};
                    for (const key in item) {
                      const newKey = key.endsWith(".") ? key.slice(0, -1) : key;
                      newItem[newKey] = item[key];
                    }
                    newItem["Serial No"] = evenSerialNo++;
                    return newItem;
                  });

                  setSecondProcessedData((prevData) => {
                    const combinedData = [...prevData, ...updatedData];
                    const lastSlNo =
                      combinedData[combinedData.length - 1]["Serial No"];
                    setLastSerialNo(lastSlNo);
                    if (combinedData.length > 100) {
                      return combinedData.slice(-100);
                    }
                    return combinedData;
                  });
                  if (gridRef) {
                    gridRef?.current?.refresh();
                  }
                }

                const updatedOddDatas = oddData.map((row) => {
                  const flattenedRow = {};
                  const mismatchData = {};

                  Object.keys(row).forEach((key) => {
                    flattenedRow[key] = row[key].Value; // Add the value to the flattened row
                    mismatchData[key] = row[key].Mismatch; // Keep mismatch information
                  });

                  flattenedRow.MismatchData = mismatchData; // Add mismatch info as a separate field
                  return flattenedRow;
                });

                let oddSerialNo = num;
                if (updatedOddDatas.length !== 0) {
                  const newDataKeys = Object.keys(updatedOddDatas[0])
                    .filter((key) => key !== "MismatchData") // Exclude 'MismatchData' key
                    .map((key) => {
                      return key.endsWith(".") ? key.slice(0, -1) : key; // Remove trailing '.'
                    });
                  setHeadData(["Serial No", ...newDataKeys]);

                  let updatedData = updatedOddDatas.map((item) => {
                    const newItem = {};
                    for (const key in item) {
                      const newKey = key.endsWith(".") ? key.slice(0, -1) : key;
                      newItem[newKey] = item[key];
                    }
                    newItem["Serial No"] = oddSerialNo++;
                    return newItem;
                  });

                  setProcessedData((prevData) => {
                    const combinedData = [...prevData, ...updatedData];
                    const lastSlNo =
                      combinedData[combinedData.length - 1]["Serial No"];
                    setLastSerialNo(lastSlNo);
                    if (combinedData.length > 100) {
                      return combinedData.slice(-100);
                    }
                    return combinedData;
                  });
                  if (gridRef) {
                    gridRef?.current?.refresh();
                  }
                }

                num = num + 1; // Increment the number for the next iteration
              }
            }
          }
        }
        // setMessage(event.data); // Update state with the received message
      };

      // Event listener for errors
      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        setScanning(false);
        setStarting(false);
        // setError("An error occurred with the WebSocket connection.");
      };

      // Event listener for when the WebSocket connection is closed
      socket.onclose = () => {
        console.log("WebSocket connection closed.");
      };

      // Cleanup the WebSocket connection when the component unmounts
      return () => {
        socket.close();
        console.log("WebSocket connection closed on component unmount.");
      };
    }
  }, [socketBaseUrl, scanning]);

  useEffect(() => {
    const secondSensitivity = localStorage.getItem("secondSensitivity");
    if (secondSensitivity === 0) {
      setIsSecondSensitivity(false);
    } else if (secondSensitivity > 0) {
      setIsSecondSensitivity(true);
    }
  }, []);

  useEffect(() => {
    const gridContainer = gridRef.current?.element?.querySelector(".e-content");

    console.log("Grid container:", gridContainer); // Check if this logs a valid DOM element
    // setIsRunning(prev=>!prev )
    if (gridContainer) {
      console.log("Attaching scroll listener");
      // gridContainer.addEventListener("scroll", handleScroll);
      // console.log(gridContainer);
      // return () => {
      // console.log("Removing scroll listener");
      // gridContainer.removeEventListener("scroll", handleScroll);
      // };
    }
  }, [gridRef]);

  useEffect(() => {
    // Function to calculate 80% of the viewport height
    const calculateGridHeight = () => {
      const height = window.innerHeight * 0.65;
      setGridHeight(`${height}px`);
    };
    const calculateDoubleGridHeight = () => {
      const height = window.innerHeight * 0.35;
      setGridHeight(`${height}px`);
    };
    const secondSensitivity = localStorage.getItem("secondSensitivity");
    if (secondSensitivity === "0") {
      calculateGridHeight();
    } else {
      calculateDoubleGridHeight();
    }

    // Update height when the window is resized
    window.addEventListener("resize", calculateGridHeight);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", calculateGridHeight);
    };
  }, [isSecondSensitivity]); // Empty dependency array to run only once and on resize
  useEffect(() => {
    const fetchData = async () => {
      const response = await getUrls();
      const GetDataURL = response.GET_PROCESS_32_PAGE_DATA;
      setProcessURL(GetDataURL);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const localTemplateId = localStorage.getItem("scantemplateId");
    const templateName = localStorage.getItem("templateName");

    if (localTemplateId) {
      setSelectedValue(localTemplateId);
      setTemplateName(templateName);
    }
  }, [location]);

  const handleScroll = async (e) => {
    const scrollTop = e.target.scrollTop;
    console.log("Scroll event triggered. ScrollTop:", scrollTop);
    if (scrollTop === 0) {
      console.log("Scrolled to top!");
      const token = localStorage.getItem("token");
      const userInfo = jwtDecode(token);
      const userId = userInfo.UserId;
      const templateId = localStorage.getItem("scantemplateId");
      const res = await getTotalExcellRow(templateId, userId);
      const totalRow = res?.totalRows;
      // Add logic for fetching older data
    }
  };

  // const getScanData = async () => {
  //   // Start numbering from the last serial number
  //   try {
  //     const token = localStorage.getItem("token");
  //     const userInfo = jwtDecode(token);
  //     const userId = userInfo.UserId;

  //     const res = await axios.get(
  //       proccessUrl + `?Id=${selectedValue}&UserId=${userId}`
  //     );
  //     const data = res.data;

  //     if (data?.result?.success) {
  //       const newDataKeys = Object.keys(data.result.data[0]).map((key) => {
  //         return key.endsWith(".") ? key.slice(0, -1) : key;
  //       });
  //       setHeadData(["Serial No", ...newDataKeys]);

  //       let updatedData = data.result.data.map((item) => {
  //         const newItem = {};
  //         for (const key in item) {
  //           const newKey = key.endsWith(".") ? key.slice(0, -1) : key;
  //           newItem[newKey] = item[key];
  //         }
  //         newItem["Serial No"] = num++;
  //         return newItem;
  //       });

  //       setProcessedData((prevData) => {
  //         const combinedData = [...prevData, ...updatedData];
  //         const lastSlNo = combinedData[combinedData.length - 1]["Serial No"];
  //         localStorage.setItem("lastSerialNo", JSON.stringify(lastSlNo));
  //         if (combinedData.length > 100) {
  //           return combinedData.slice(-100);
  //         }
  //         return combinedData;
  //       });

  //       // setLastSerialNo(num - 1); // Update the last serial number
  //       gridRef.current.refresh();
  //       return res;
  //     }

  //     return {
  //       success: false,
  //       data: res?.data?.result,
  //       message: "The API response did not indicate success.",
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     setTimeout(() => {
  //       handleStop();
  //     }, 1000);
  //     toast.error("Unable to fetch data!!!");
  //     return error;
  //   }
  // };
  // const getScanData = async () => {
  //   let num = 1;
  //   try {
  //     const token = localStorage.getItem("token");
  //     const userInfo = jwtDecode(token);
  //     const userId = userInfo.UserId;

  //     const res = await axios.get(
  //       proccessUrl + ?Id=${selectedValue}&UserId=${userId}
  //     );
  //     const data = res.data;

  //     if (data?.result?.success) {
  //       const newDataKeys = Object.keys(data.result.data[0]).map((key) => {
  //         return key.endsWith(".") ? key.slice(0, -1) : key;
  //       });
  //       setHeadData(["Serial No", ...newDataKeys]);
  //       let updatedData = [];

  //       updatedData = data.result.data.map((item) => {
  //         const newItem = {};
  //         for (const key in item) {
  //           const newKey = key.endsWith(".") ? key.slice(0, -1) : key;
  //           newItem[newKey] = item[key];
  //         }
  //         newItem["Serial No"] = num++;
  //         return newItem;
  //       });

  //       // setProcessedData(updatedData);
  //       setProcessedData((prevData) => {
  //         const combinedData = [...prevData, ...updatedData]; // Add new data to the rear
  //         if (combinedData.length > 100) {
  //           return combinedData.slice(-100); // Keep only the last 100 items
  //         }
  //         return combinedData;
  //       });

  //       gridRef.current.refresh();
  //       return res;
  //     }
  //     return {
  //       success: false,
  //       data: res?.data?.result,
  //       message: "The API response did not indicate success.",
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     await handleStop();
  //     toast.error("Unable to fetch data");
  //     return error;
  //   }
  // };
  // useEffect(() => {
  //   if (!scanning) return;

  //   const intervalId = setInterval(() => {
  //     if (scanning) {
  //       getScanData();
  //     } else {
  //       clearInterval(intervalId);
  //     }
  //   }, 3000);

  //   return () => clearInterval(intervalId);
  // }, [scanning]);

  const handleStart = async () => {
    // setShowPrintModal(true);
    // return
    let startingIntervalId;
    let scanningTimeoutId;
    try {
      setStarting(true);
      const token = localStorage.getItem("token");

      if (token) {
        const userInfo = jwtDecode(token);
        const userId = userInfo.UserId;
        startingIntervalId = setTimeout(() => {
          setStarting(false);
        }, 6000);

        scanningTimeoutId = setTimeout(() => {
          setScanning(true);
        }, 6000);
        const response = await scanFiles(selectedValue, userId);
        // Clear the timeouts after the response is received
        clearTimeout(startingIntervalId);
        clearTimeout(scanningTimeoutId);
        if (!response?.result?.success) {
          await handleStop();
          toast.error(response?.result?.message);
        } else {
          toast.success(response?.result?.message);
        }
        if (response) {
          if (!response?.success) {
            toast.error(response?.message);
          } else {
            toast.success(response?.message);
          }
          setScanning(false);
        }
        if (response === undefined) {
          toast.error("Request Timeout");
          setScanning(false);
        }
      }
    } catch (error) {
      await handleStop();
      setStarting(false);
      // Clear the timeouts after the response is received
      clearTimeout(startingIntervalId);
      clearTimeout(scanningTimeoutId);
      console.log(error);
    }
  };

  const handleSave = (args) => {
    if (args.data) {
      const updatedData = [...processedData];
      console.log(updatedData);
      const index = updatedData.findIndex(
        (item) => item["Serial No"] == args.data["Serial No"]
      );
      if (index > -1) {
        updatedData[index] = args.data;
        console.log(updatedData);
        setProcessedData(updatedData);
      }
    }
  };

  const handleRefresh = () => {
    try {
      refreshScanner();
    } catch (error) {
      console.log(error);
      toast.error("Error in Refresh");
    }
  };

  const dataBound = () => {
    // if(!isAutoScrollEnabled){
    if (gridRef.current) {
      const grid = gridRef.current;
      const lastIndex = grid.dataSource.length - 1;

      // Ensure data source is not empty
      if (lastIndex >= 0) {
        setTimeout(() => {
          const gridContent = grid?.getContent()?.firstElementChild;
          gridContent.scrollTo({
            top: gridContent.scrollHeight,
            behavior: "smooth",
          });
        }, 500); // Delay to ensure the grid is fully rendered before scrolling
      }
    }
    // gridRef.current.refresh();
    // }
  };
  const handleToolbarClick = (args) => {
    if (args.item.id.includes("excelexport")) {
      gridRef.current.refresh(); // Ensure the grid data is refreshed
      gridRef.current.excelExport();
    }
    if (args.item.id.includes("pdfexport")) {
      gridRef.current.refresh(); // Ensure the grid data is refreshed
      gridRef.current.pdfExport();
    }
    if (args.item.id.includes("csvexport")) {
      gridRef.current.refresh(); // Ensure the grid data is refreshed
      gridRef.current.csvExport();
    }
  };
  const handleStop = async () => {
    try {
      setScanning(false);
      setStarting(false);
      const cancel = await cancelScan();
    } catch (error) {
      console.log(error);
    }
  };
  console.log(processedData);
  const columnsDirective = headData.map((item, index) => {
    return (
      <ColumnDirective
        field={`${item}`}
        key={index}
        headerText={item}
        width="120"
        textAlign="Center"
      ></ColumnDirective>
    );
  });
  // const completeJobHandler = async () => {
  //   try{
  //   const result = window.confirm("Are you sure to finish the job ?");
  //   if (!result) {
  //     return;
  //   }
  //   const id = localStorage.getItem("jobId");
  //   const templateId = localStorage.getItem("scantemplateId");

  //   const obj = {
  //     id: id,
  //     templateId: templateId,
  //   };
  //   const res = await finishJob(obj);
  //   if (res?.success) {
  //     const token = localStorage.getItem("token");

  //     if (token) {
  //       const userInfo = jwtDecode(token);
  //       const userId = userInfo.UserId;
  //       const response2 = await getUrls();
  //       const GetDataURL = response2?.GENERATE_EXCEL;
  //       const excelgenerate =  axios.get(
  //         GetDataURL + `?Id=${selectedValue}&UserId=${userId}`
  //       );
  //     }
  //     toast.success("Completed the job!!");
  //     navigate("/admin/job-queue", { replace: true });
  //   }
  // }catch(err){
  //   console.log("Error Occured",err);
  //   toast.error("Error Occured during saving the job!");
  // }
  // };

  const completeJobHandler = async () => {
    try {
      const result = window.confirm("Are you sure to finish the job?");
      if (!result) {
        return;
      }

      const id = localStorage.getItem("jobId");
      const templateId = localStorage.getItem("scantemplateId");

      if (!id || !templateId) {
        toast.error("Required data is missing!");
        return;
      }

      const obj = { id, templateId };
      const res = await finishJob(obj);

      if (res?.success) {
        toast.success("Completed the job!");
        setTimeout(() => navigate("/admin/job-queue", { replace: true }), 500); // Delay for toast visibility
      }
    } catch (err) {
      console.error("Error occurred", err);
      toast.error("Error occurred during saving the job!");
    }
  };
  const queryCellInfo = (args) => {
    const field = args.column.field;
    const rowData = args.data;

    if (rowData.MismatchData && rowData.MismatchData[field]) {
      args.cell.style.backgroundColor = "#f28b82"; // Light red background
      args.cell.style.color = "#ffffff"; // White font
    }
  };
  const rowDataBound = (args) => {
    // Loop through each column's data
    console.log(originalData);
    const originalItem = originalData[args.row]; // Match the row index to original data
    console.log(originalItem);
    // Object.keys(originalItem).forEach((key) => {
    //   // console.log(key)
    //   // if (originalItem[key]?.Mismatch) {
    //   //   const cell = args.row.querySelector(`[aria-label*="${key}"]`); // Locate the cell
    //   //   if (cell) {
    //   //     cell.style.backgroundColor = "red"; // Highlight mismatched cell
    //   //   }
    //   // }
    // });
  };
  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem("token");

      if (token) {
        const userInfo = jwtDecode(token);
        const userId = userInfo.UserId;
        const templateId = localStorage.getItem("scantemplateId");
        const res = await getTotalExcellRow(templateId, userId);
        const totalRow = res?.totalRows;
        if (totalRow) {
          const startRow = +totalRow - 100;
          const endRow = +totalRow + 1;
          const response = await getDataByRowRange(
            startRow,
            endRow,
            templateId,
            userId
          );
          if (response) {
            const filterData = response.map((item) => {
              return item.data;
            });
            const newDataKeys = Object.keys(filterData[0]).map((key) => {
              return key.endsWith(".") ? key.slice(0, -1) : key;
            });
            setHeadData([...newDataKeys]);
            setProcessedData(filterData);
          }
        }
      }
    } catch (error) {
      toast.error("Could not get data");
      console.log(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle the toggle switch
  const handleToggle = (event) => {
    setIsAutoScrollEnabled(event.target.checked);

    if (event.target.checked) {
      console.log("Auto Scroll Enabled");
      gridRef.current.refresh();
      // Add functionality to enable auto-scroll here
    } else {
      console.log("Auto Scroll Disabled");
      // Add functionality to disable auto-scroll here
    }
  };
  const handleOldRefreshData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userInfo = jwtDecode(token);
      const userId = userInfo.UserId;

      const res = await axios.get(
        proccessUrl + `?Id=${selectedValue}&UserId=${userId}`
      );
      const data = res.data;

      if (data?.result?.success) {
        const newDataKeys = Object.keys(data.result.data[0]).map((key) => {
          return key.endsWith(".") ? key.slice(0, -1) : key;
        });
        setHeadData(["Serial No", ...newDataKeys]);

        let updatedData = data.result.data.map((item) => {
          const newItem = {};
          for (const key in item) {
            const newKey = key.endsWith(".") ? key.slice(0, -1) : key;
            newItem[newKey] = item[key];
          }
          newItem["Serial No"] = num++;
          return newItem;
        });

        setProcessedData((prevData) => {
          const combinedData = [...prevData, ...updatedData];
          const lastSlNo = combinedData[combinedData.length - 1]["Serial No"];
          localStorage.setItem("lastSerialNo", JSON.stringify(lastSlNo));
          if (combinedData.length > 100) {
            return combinedData.slice(-100);
          }
          return combinedData;
        });
      }
      gridRef.current.refresh();
    } catch (error) {
      console.log(error);
    }
  };
  // console.log(location.state)
  return (
    <>
      <NormalHeader />
      <div
        style={{
          position: "absolute",
          top: "20px",
          padding: "10px",
          zIndex: "999",
        }}
      >
        <nav
          style={{ "--bs-breadcrumb-divider": "'>'" }}
          aria-label="breadcrumb"
        >
          <ol className="breadcrumb" style={{ fontSize: "0.8rem" }}>
            <li className="breadcrumb-item">
              <Link to="/admin/job-queue">Job queue</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {templateName}
            </li>
          </ol>
        </nav>
      </div>
      <div
        style={{
          position: "absolute",
          left: isSmallScreen ? "30%" : "40%",
          top: isSmallScreen ? "10px" : "20px",
          zIndex: "999",
        }}
      >
        <Button variant="primary" onClick={completeJobHandler}>
          Complete Job
        </Button>
      </div>
      <Container className={isSmallScreen ? "mt--6" : "mt--8"} fluid>
        <br />

        {/* <div className="control-pane"> */}
        <div
          className="w-100  m-1"
          style={{ overflowY: "auto", backgroundColor: "green", zIndex: "999" }}
        >
          {/* <div
            className="w-100 d-flex"
            style={{ zIndex: "999", width: "8%", height: "80%" }}
          >
          \
            <input
              type="number"
            
              ref={serialRef}
              style={{ zIndex: "999", width: "8%" }}
            />
          </div> */}

          {/* <div className="d-flex justify-content-end  custom-control custom-switch">
            <input
              type="checkbox"
              className="custom-control-input"
              id="customSwitch1"
              checked={isAutoScrollEnabled}
              onChange={handleToggle}
            />
            <label className="custom-control-label" htmlFor="customSwitch1">
              Auto Scroll
            </label>
          </div> */}
        </div>
        <div className="control-section">
          <GridComponent
            ref={gridRef}
            dataBound={dataBound}
            actionComplete={handleSave}
            dataSource={processedData}
            height={gridHeight}
            allowSorting={false}
            editSettings={editSettings}
            allowFiltering={false}
            filterSettings={filterSettings}
            // toolbar={toolbar}
            enableVirtualization={isAutoScrollEnabled}
            toolbarClick={handleToolbarClick}
            allowExcelExport={true}
            allowPdfExport={false}
            allowEditing={false}
            emptyRecordTemplate={template.bind(this)}
            rowDataBound={rowDataBound}
            queryCellInfo={queryCellInfo}
          >
            <ColumnsDirective>{columnsDirective}</ColumnsDirective>
            <Inject services={[VirtualScroll]} />
          </GridComponent>

          {isSecondSensitivity && (
            <GridComponent
              // ref={gridRef}
              dataBound={dataBound}
              actionComplete={handleSave}
              dataSource={secondProcessedData}
              height={gridHeight}
              allowSorting={false}
              editSettings={editSettings}
              allowFiltering={false}
              filterSettings={filterSettings}
              // toolbar={toolbar}
              enableVirtualization={isAutoScrollEnabled}
              toolbarClick={handleToolbarClick}
              allowExcelExport={true}
              allowPdfExport={false}
              allowEditing={false}
              emptyRecordTemplate={template.bind(this)}
              rowDataBound={rowDataBound}
              queryCellInfo={queryCellInfo}
            >
              <ColumnsDirective>{columnsDirective}</ColumnsDirective>
              <Inject services={[VirtualScroll]} />
            </GridComponent>
          )}

          <div>
            <Button
              className="mt-2"
              color={"info"}
              disabled={isRefreshing}
              onClick={handleRefreshData}
            >
              {isRefreshing ? " Refreshing Old Data" : "Refresh Old Data"}
            </Button>
            <Button
              className="mt-2"
              color={"warning"}
              onClick={handleOldRefreshData}
            >
              Refresh Latest Data
            </Button>

            <div className="m-2" style={{ float: "right" }}>
              <Button
                className=""
                color={"success"}
                type="button"
                onClick={handleStart}
                disabled={scanning || starting ? true : false}
              >
                {starting && !scanning && "Starting"}
                {!starting && !scanning && "Start"}
                {scanning && "Scanning"}
              </Button>
              {scanning && (
                <Button color="danger" type="button" onClick={handleStop}>
                  Cancel Scanning
                </Button>
              )}
            </div>
          </div>
          {/* </div> */}
        </div>
      </Container>
      {showPrintModal && <PrintModal show={showPrintModal} />}
    </>
  );
};

export default AdminScanJob;

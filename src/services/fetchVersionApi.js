const fetchVersion = async () => {
  try {
    // Fetch the config.json file
    const response = await fetch("/config.json");

    // Check if the response is OK
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    // Parse the JSON response
    const config = await response.json();

    // Extract configuration values
    const version = config.version;
    const last_version_date = config.last_version_date;

    // Return the values
    return { version, last_version_date };
  } catch (error) {
    console.error("Error fetching config:", error);
    // Optionally, you could return a fallback object or value here
    return { version: null, last_version_date: null };
  }
};

export default fetchVersion;

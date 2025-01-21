function splitFrontBackImagePaths(imagePaths) {
  const result = [];
  const frontImages = [];
  const backImages = [];

  // Filter out null values and separate front and back images
  imagePaths.forEach((path) => {
    if (path) {
      if (path.includes("_Front")) {
        frontImages.push(path);
      } else if (path.includes("_Back")) {
        backImages.push(path);
      }
    }
  });

  // Create objects by pairing front and back images
  frontImages.forEach((frontImagePath, index) => {
    const backImagePath = backImages[index] || null; // Match by index, or set null if no back image
    result.push({ frontImagePath, backImagePath });
  });

  return result;
}
export default splitFrontBackImagePaths;
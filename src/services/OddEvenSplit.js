const splitOddEven = (data) => {
  const oddData = [];
  const evenData = [];

  data.forEach((item, index) => {
    if (index % 2 === 0) {
      evenData.push(item); // Even index
    } else {
      oddData.push(item); // Odd index
    }
  });

  return { oddData, evenData };
};

export default splitOddEven;

const generateItems = () => {
  const items = [];
  for (let i = 1; i <= 1000000; i++) {
    items.push({ id: i, text: `Item ${i}` });
  }
  return items;
};

exports.generateItems = generateItems;

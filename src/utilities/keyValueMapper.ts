const keyValueMapper = (data: any) => {
  return Object.entries(data).map(([key, value]) => {
    return {
      name: value,
      id: key,
    };
  });
};
export default keyValueMapper;

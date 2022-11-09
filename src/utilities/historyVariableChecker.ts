const historyVaribaleChecker = (data: any, history: any) => {
  if (history.location.state) return history.location.state[data];
  else return null;
};

export default historyVaribaleChecker;

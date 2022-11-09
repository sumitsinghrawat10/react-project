import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    width: 200,
    "& .MuiOutlinedInput-input": {
      fontWeight: "normal",
      borderWidth: 0,
      backgroundColor: "#f4f5f8",
    },
    "& .MuiInputLabel-root": {
      borderWidth: 0,
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
      borderWidth: 0,
    },
    "&. MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "&:hover .MuiOutlinedInput-input": {},
    "&:hover .MuiInputLabel-root": {},
    "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {},
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {},
    "& .MuiInputLabel-root.Mui-focused": {},
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderWidth: 0,
      borderBottomWidth: 2,
      borderColor: "#233ce6",
    },
  },
  dialogPaper: {
    width: "560px",
    height: "270px",
  },
});

const dateFieldStyle = makeStyles({
  root: {
    width: 200,
    "& .MuiOutlinedInput-input": {
      fontWeight: "normal",
      borderWidth: 0,
      backgroundColor: "#f4f5f8",
    },
    "& .MuiInputLabel-root": {
      borderWidth: 0,
      width: "75%",
    },
    "& .MuiInputLabel-shrink": {
      width: "104%",
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
      borderWidth: 0,
    },
    "&. MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "&:hover .MuiOutlinedInput-input": {},
    "&:hover .MuiInputLabel-root": {},
    "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {},
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {},
    "& .MuiInputLabel-root.Mui-focused": { width: "104%" },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderWidth: 0,
      borderBottomWidth: 2,
      borderColor: "#233ce6",
    },
  },
  dialogPaper: {
    width: "560px",
    height: "270px",
  },
});

export { useStyles, dateFieldStyle };

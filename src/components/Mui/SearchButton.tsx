import React from "react";

import { Button } from "@mui/material";
import styled from "styled-components";

interface PropType {
  SearchText: string;
  SearchButtonHandler: any;
}

const SearchBtn = styled(Button)`
  width: 150px;
  height: 63% !important;
`;
const SearchButton: React.FC<PropType> = (props: PropType) => {
  return (
    <>
      <SearchBtn
        className="mb-5"
        variant="contained"
        onClick={() => {
          if (props.SearchText.trim().length > 0) {
            props.SearchButtonHandler();
          }
        }}
        sx={{
          backgroundColor: "#233ce6",

          "&:hover": {
            backgroundColor: "#001e46",
          },
        }}
      >
        Search
      </SearchBtn>
    </>
  );
};

export default SearchButton;

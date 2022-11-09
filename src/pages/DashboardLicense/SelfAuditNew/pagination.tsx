import React from "react";

import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
interface PageinationProps {
  categoryWiseQues: any;
  currentPage: number;
  handlePagination: any;
  executeScroll: any;
}

const Pagination = (props: PageinationProps) => {
  return (
    <div className="dashboard-license-container dashboardLicense-SelfAudit-Pagination-container">
      <div className="d-flex ml-5 ProgressCircleWrapper">
        {props.categoryWiseQues.map((_itm: any, index: number) => (
          <div className="pt-4 ml-2 PaginationIconWrapper">
            {index === props.currentPage && (
              <CircleRoundedIcon className="CircleRounded" />
            )}
            {index !== props.currentPage && (
              <CircleOutlinedIcon
                className="CircleOutlined"
                onClick={() => {
                  props.handlePagination(index);
                  props.executeScroll();
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default Pagination;

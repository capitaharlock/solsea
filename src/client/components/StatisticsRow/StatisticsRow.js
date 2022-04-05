import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import s from "./StatisticsRow.scss";

const StatisticsRow = ({ row, index, pageIndex, pageSize }) => {
  useStyles(s);
  return (
    <tr className={`${s.tableRowStats}`} key={row._id} {...row.getRowProps()}>
      {row.cells.map((cell, i) => {
        return (
          <td
            className={`${s.tableData} ${s.smallerContainer}`}
            key={i}
            {...cell.getCellProps()}
          >
            {i === 0 ? (
              index + 1 + pageIndex * pageSize
            ) : i === 1 ? (
              <img
                src={cell.value ? cell.value : "/assets/no_collection_icon.jpg"}
                className={`${s.lazy} ${s.nftItemPreview}`}
                alt=""
              />
            ) : (
              cell.render("Cell")
            )}
          </td>
        );
      })}
    </tr>
  );
};

export default StatisticsRow;

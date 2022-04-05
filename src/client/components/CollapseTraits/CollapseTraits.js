import useStyles from "isomorphic-style-loader/useStyles";
import React, { useState } from "react";
import s from "./CollapseTraits.scss";
import TraitHolder from "./TraitHolder";

const CollapseTraits = ({ trait, value, onTraitSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
    setIsOpen(!isOpen);
  };
  useStyles(s);
  return (
    <>
      <div className={`${s.traitCollapseContainer}`}>
        <p>
          <a
            className={`${s.btnName} d-flex col-lg-12 mb-3
            ${isOpen || value ? s.selected : s.traitCollapseBtn}`}
            data-toggle="collapse"
            role="button"
            aria-expanded="false"
            onClick={toggle}
          >
            {trait.trait_type}
            {!isOpen ? (
              <i className={`fa fa-angle-right me-1`}></i>
            ) : (
              <i className={`fa fa-angle-down me-1`}></i>
            )}
          </a>
        </p>
        <div className={`${isOpen ? "" : "collapse"} ${s.traitContainer}`}>
          {trait &&
            trait.value &&
            isOpen &&
            trait.value.map(traitValue => (
              <TraitHolder
                key={traitValue.type}
                trait={{
                  trait_type: trait.trait_type,
                  ...traitValue
                }}
                selected={value && value[traitValue.type]}
                onTraitSelect={onTraitSelect}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default CollapseTraits;

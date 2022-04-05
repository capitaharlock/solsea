/* eslint-disable prettier/prettier */
/* eslint-disable react/react-in-jsx-scope */
import React, { useEffect, useState } from "react";
import { arrayBufferToBase64 } from "all-art-core/lib/utils/ipfs";
import GLBRenderer from "./GLBRenderer";
import { getFileTypeFromBuffer } from "all-art-core/lib/utils/fileType";
import { fileToBuffer } from "all-art-core/lib/utils/file";
import { FileTypes } from "all-art-core/lib/utils/fileType";
import { CONTENT_URL } from "../../../api/Definitions";
import client from "../../services/feathers";
import { useTranslation } from "react-i18next";

const ImageSelector = ({
  innerText1,
  innerText2,
  innerText3,
  className,
  alt,
  onChange,
  name,
  value,
  sizeLimit,
  supportedTypes = [FileTypes.jpg, FileTypes.gif, FileTypes.png]
}) => {
  const { t } = useTranslation();
  const [img, setImg] = useState(null);
  const [glb, setGlb] = useState(null);
  const [movie, setMovie] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (value && typeof value === "string" && img === null) {
      getFile(value).then(file => {
        if (file && file.s3 && file.s3.thumbnail) {
          setImg(CONTENT_URL + file.s3.thumbnail);
        }
      });
    }
  }, [value]);

  const getFile = async id => {
    return await client.service("files").get(id);
  };

  async function updatePreview(file) {
    if (file && file.size && file.size > sizeLimit) {
      alert(`${t("fileMustBeUnder")} ${sizeLimit / 1024 / 1024}MB!`);
      return;
    }

    const processFile = async file => {
      const buffer = await fileToBuffer(file);
      const fileType = getFileTypeFromBuffer(buffer);
      const isSupportedFileType =
        supportedTypes.indexOf(fileType) < 0 ? false : true;

      if (!isSupportedFileType) alert(t("notification.unsupportedFileType"));
      else {
        if (fileType === FileTypes.glb) {
          alert(t("notification.unsupportedFileType"));
          // setGlb(buffer);
          // onChange && onChange(file);
        } else if (fileType === FileTypes.mp4 || fileType === FileTypes.mov) {
          // alert("Unsupported file type!");
          setMovie(file);
          onChange && onChange(file);
        } else if (
          fileType === FileTypes.gif ||
          fileType === FileTypes.png ||
          fileType === FileTypes.jpg
        ) {
          setImg(await arrayBufferToBase64(buffer));
          onChange && onChange(file);
        } else {
          alert(t("notification.unsupportedFileType"));
        }
      }
    };
    processFile(file);
  }

  function resetPreview() {
    setImg(null);
    setGlb(null);
    setMovie(null);
  }

  return (
    <div
      className={className ? className : "image-selector"}
      onMouseOver={() => {
        setShowUpload(true);
      }}
      onMouseLeave={() => {
        setShowUpload(false);
      }}
    >
      {img && <img src={`${img}`} alt={alt ? alt : ""} />}
      {glb && <GLBRenderer data={glb} width={300} height={300} />}
      {movie && (
        <video
          width={300}
          height={300}
          controls
          loop
          src={URL.createObjectURL(movie)}
        />
      )}

      {((img === null && glb === null) || showUpload) && (
        <label htmlFor={`file-upload-${name}`} className="custom-file-upload">
          <i className="fa fa-cloud-upload"></i> {innerText1}
          <br />
          <br />
          {innerText2}
          <br />
          <br />
          {innerText3}
        </label>
      )}
      {/* <input style={{display:"none"}} type="file" id="file-upload" accept="image/png, image/jpeg" multiple={false} onChange={(e)=>{ */}
      <input
        style={{ display: "none" }}
        type="file"
        id={`file-upload-${name}`}
        multiple={false}
        onChange={e => {
          e.preventDefault();
          if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            resetPreview();
            updatePreview(file);
          }
        }}
      />
    </div>
  );
};
export default ImageSelector;

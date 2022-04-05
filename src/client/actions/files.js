import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { connect } from "all-art-core/lib/core/connection";
import { ARWEAVE_FEE_ACCOUNT } from "all-art-core/lib/core/consts";
import axios from "axios";
import { API_URL, CLUSTER_URL } from "../../api/Definitions";
import client from "../services/feathers";

export function handleUpload({ file, fileCollection, onProgress }) {
  return new Promise((resolve, reject) => {
    client.authentication.getAccessToken().then(token => {
      const f = new FileReader();
      f.onload = () => {
        const formData = new FormData();
        formData.append("file", file);
        axios
          .post(`${API_URL}/files`, formData, {
            headers: {
              "x-filename": file.name,
              "x-file-collection": fileCollection,
              "content-type": "multipart/form-data",
              authorization: "Bearer " + token
            },
            onUploadProgress: onProgress
          })
          .then(res => {
            resolve(res.data[0]._id);
          })
          .catch(e => {
            reject(e);
          });
      };
      f.readAsArrayBuffer(file);
    });
  });
}

export async function handleUploadArweaveFiles({ file, onProgress }) {
  const token = await client.authentication.getAccessToken();
  const form = new FormData();
  form.append("file", file);
  const result = await axios.post(`${API_URL}/arweave-upload`, form, {
    headers: {
      "x-filename": file.name,
      "content-type": "multipart/form-data",
      authorization: "Bearer " + token
    },
    onUploadProgress: onProgress
  });

  return result;
}

export async function handleArweaveUpload(file, wallet, onProgress, onStatus) {
  console.log("FILE TO UPLOAD", file);
  const chunkSize = 1024 * 64;
  const buffer = await fileToBuffer(file);
  let chunk =
    buffer.byteLength > chunkSize ? buffer.slice(0, chunkSize) : buffer;
  const connection = await connect(CLUSTER_URL);
  const arweaveTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      lamports: await getFileCost([file]),
      toPubkey: new PublicKey(ARWEAVE_FEE_ACCOUNT)
    })
  );
  arweaveTransaction.recentBlockhash = (
    await connection.getRecentBlockhash("finalized")
  ).blockhash;
  arweaveTransaction.feePayer = wallet.publicKey;
  const signedArWeaveTransaction = await wallet.signTransaction(
    arweaveTransaction
  );
  if (signedArWeaveTransaction) {
    client.service("arweave-upload").timeout = 1000 * 60 * 5;
    client.service("arweave-upload").on("created", message => {
      console.log("FILE CREATED MESSAGE", message);
    });
    const fileTx = await client.service("arweave-upload").create({
      file: {
        name: file.name,
        mime: file.type,
        extension: fileExtension(file),
        buffer: chunk
      },
      transaction: signedArWeaveTransaction.serialize()
    });
    if (fileTx) {
      client.service("arweave-upload").timeout = 1000 * 64;
      for (let c = chunkSize; c < buffer.byteLength; c += chunkSize) {
        chunk =
          c + chunk < buffer.byteLength
            ? buffer.slice(c, c + chunkSize)
            : buffer.slice(c);
        const chunkUploaded = await client
          .service("arweave-upload")
          .patch(fileTx, {
            name: file.name,
            mime: file.type,
            extension: fileExtension(file),
            buffer: chunk
          });
        if (!chunkUploaded) throw new Error("File upload faild!");
      }
      return await client.service("arweave-upload").get(fileTx);
    } else {
      throw new Error("File upload faild!");
    }
  }
  throw new Error("Transaction signing faild!");
}

async function fileToBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) resolve(Buffer.from(reader.result));
    };
    reader.onerror = e => {
      reject("File to buffer faild!");
    };
    reader.readAsArrayBuffer(file);
  });
}

function fileExtension(file) {
  return file.type.split("/")[1];
}

async function getFileCost(files) {
  return 1000000000;
}

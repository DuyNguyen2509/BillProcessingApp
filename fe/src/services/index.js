import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8001/api/v1'
});

export const httpGet = async url => {
  return instance.get(url).then(response => response.data);
};

export const httpPost = async (url, body) => {
  const requestBody = body || {};
  return instance.post(url, requestBody).then(response => response.data);
};

export const httpPut = async (url, body) => {
  const requestBody = body || {};
  return instance.put(url, requestBody).then(response => response.data);
};

export const httpDelete = async url => {
  return instance.delete(url).then(response => response.data);
};

export const httpUpload = async (url, body = {}) => {
  const formData = new FormData();
  for (const key in body) {
    formData.append(key, body[key]);
  }
  return instance.post(url, formData).then(response => response.data);
};

export const httpPutUpload = async (url, body = {}) => {
  const formData = new FormData();
  for (const key in body) {
    formData.append(key, body[key]);
  }
  return instance.put(url, formData).then(response => response.data);
};

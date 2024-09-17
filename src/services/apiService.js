const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs'); 
const path = require('path');
const axiosInstance = axios.create({
  timeout: 20000 
});

const dotenv = require('dotenv');
dotenv.config();
const createResponse = require('./../utils/createResponse')

const ensureDirectoryExists = async (dir) => {
  try {
    await fs.promises.access(dir); 
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.promises.mkdir(dir, { recursive: true }); 
    } else {
      throw err;
    }
  }
};

const writeJsonToFile = async (data, filePath) => {
  try {
    const dir = path.dirname(filePath);
    await ensureDirectoryExists(dir); 
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2)); 
    return filePath;
  } catch (err) {
    throw err;
  }
};

exports.trainModel = async (restaurant_id, data) => {
  const filePath = path.join(__dirname, '../temp', `productos-${restaurant_id}.json`);
  
  try {
    await writeJsonToFile(data, filePath);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const url = `${process.env.API_MULDER_ENDPOINT}${process.env.API_MULDER_MODEL_ENDPOINT}/train/${restaurant_id}`;

    const result = await axiosInstance.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    await fs.promises.unlink(filePath);

    if (result.data?.code !== 200) {
      return createResponse({code:'ERROR_MODEL_TRAIN'})
    }
    return createResponse({success: true,data: result.data})
  } catch (err) {
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkErr) {
      return createResponse({code:'ERROR_MODEL_TRAIN'})
    }
    return createResponse({code:'ERROR_API'})
  }
};


exports.statusModel = async (restaurant_id) => {
  try{
    const result = await axiosInstance.get(`${process.env.API_MULDER_ENDPOINT}${process.env.API_MULDER_MODEL_ENDPOINT}/status/${restaurant_id}`);

    if(result.data.code !=200){
      return createResponse({code:'ERROR_MODEL_STATUS'})
    }
    return createResponse({success: true,data: result.data})
  }
  catch(err){
    return createResponse({code:'ERROR_API'})
  }
};

exports.getStreetMap = async (lat,lon) => {
  try{

    let url=String(process.env.API_GEO)
    url=url.replace('%lat%',lat)
    url=url.replace('%lon%',lon)

    const result = await axiosInstance.get(url);

    if(result.status !=200){
      return createResponse({code:'ERROR_GEO_PARSE'})
    }
    return createResponse({success: true,data: result.data})
  }
  catch(err){
    return createResponse({code:'ERROR_API'})
  }
};



exports.parseMessage = async (restaurant_id,consult) => {
  try{
    const result = await axiosInstance.post(`${process.env.API_MULDER_ENDPOINT}${process.env.API_MULDER_MODEL_ENDPOINT}/parsec/${restaurant_id}`, {text:consult});

    if(result.data.code !=200){
      return createResponse({code:'ERROR_MODEL_PARSE'})
    }
    let selectIntent = ''
    if (result.data.success.intent.name === "nlu_fallback") {
      selectIntent = result.data.success.intent_ranking[1].name;
    } else {
      selectIntent = result.data.success.intent.name
    }
    return createResponse({success: true,data: {intent:selectIntent,entities:result.data.success.entities}})
  }
  catch(err){
    return createResponse({code:'ERROR_API'})
  }
};

exports.listContainers = async () => {
  try{
    const result = await axiosInstance.patch(`${process.env.API_MULDER_ENDPOINT}${process.env.API_MULDER_DOCKER_ENDPOINT}/listContainers`);

    if(result.data.code !=200){
      return createResponse({code:'ERROR_CONTAINER_LISTS'})
    }
    return createResponse({success: true,data: result.data})
  }
  catch(err){
    return createResponse({code:'ERROR_API'})
  }
};

exports.startAllContainers = async () => {
  try{
    const result = await axiosInstance.patch(`${process.env.API_MULDER_ENDPOINT}${process.env.API_MULDER_DOCKER_ENDPOINT}/startAllContainers`);

    if(result.data.code !=200){
      return createResponse({code:'ERROR_CONTAINER_START_ALL'})
    }
    return createResponse({success: true,data: result.data})
  }
  catch(err){
    return createResponse({code:'ERROR_API'})
  }
};

exports.stopContainer = async (restaurant_id) => {
  try{
    const result = await axiosInstance.patch(`${process.env.API_MULDER_ENDPOINT}${process.env.API_MULDER_DOCKER_ENDPOINT}/stopContainer`, {container_name:restaurant_id});

    if(result.data.code !=200){
      return createResponse({code:'ERROR_CONTAINER_STOP'})
    }
    return createResponse({success: true,data: result.data})
  }
  catch(err){
    return createResponse({code:'ERROR_API'})
  }
};

exports.startContainer = async (restaurant_id) => {
  try{
    const result = await axiosInstance.patch(`${process.env.API_MULDER_ENDPOINT}${process.env.API_MULDER_DOCKER_ENDPOINT}/startContainer`, {container_name:restaurant_id});

    if(result.data.code !=200){
      return createResponse({code:'ERROR_CONTAINER_START'})
    }
    return createResponse({success: true,data: result.data})
  }
  catch(err){
    return createResponse({code:'ERROR_API'})
  }
};

exports.createContainer = async (restaurant_id) => {
  try{
    const result = await axiosInstance.post(`${process.env.API_MULDER_ENDPOINT}${process.env.API_MULDER_DOCKER_ENDPOINT}/createContainer`, {container_name:restaurant_id});

    if(result.data.code !=200){
      return createResponse({code:'ERROR_CONTAINER_CREATE'})
    }
    return createResponse({success: true,data: result.data})
  }
  catch(err){
    return createResponse({code:'ERROR_API'})
  }
};
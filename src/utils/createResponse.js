module.exports = ({ success = false, code = 'ERROR_MESSAGE', data = null,placeholder=null} = {}) => {
    return { 
      success, 
      code, 
      data, 
      placeholder 
    };
  };
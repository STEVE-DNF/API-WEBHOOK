const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

module.exports = (number)=>{
    const phoneNumber = phoneUtil.parse(number, 'PE');

    return {
        code:phoneNumber.values_['1'],
        phone:phoneNumber.values_['2']
    }
}
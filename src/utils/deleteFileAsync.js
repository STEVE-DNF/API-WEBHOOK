const fs = require('fs').promises
const path = require('path');

module.exports = async (name)=>{

    const file = path.join(__dirname, `../data/${name}`);
    try {
        await fs.unlink(file);
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}
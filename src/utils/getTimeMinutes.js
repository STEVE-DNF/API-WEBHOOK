module.exports = (date) => {

    const dateCompare = new Date(date);
    const dateNow = new Date();

    const differenceInMilliseconds = dateNow - dateCompare;

    const minutes = Math.abs(Math.floor(differenceInMilliseconds / 60000))-1
    let seconds = Math.abs(Math.floor((differenceInMilliseconds % 60000) / 1000))
    
    if (seconds < 10) seconds = `0${seconds}`
    return `${minutes}:${seconds}`

}

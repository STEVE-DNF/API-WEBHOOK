module.exports = (startHour,startMinute,endHour,endMinute) =>{
    const startToday = new Date(Date.now());
    const nowToday = new Date(Date.now());
    const endToday = new Date(Date.now());
    
    startToday.setHours(startHour,startMinute, 0, 0);
    endToday.setHours(endHour,endMinute, 0, 0);
  
    const startTime = startToday.getTime();
    const endTime = endToday.getTime();
  
    return (nowToday > startTime && nowToday < endTime)
  }
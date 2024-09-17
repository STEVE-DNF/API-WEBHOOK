const APIFeatures = require('./../utils/apiFeatures')

const optionsUpdate = {
    new: true, 
    upsert: true, 
    runValidators: true
}

exports.filterObject = (body,filterFields)=>{
    let bodyFilter = new Map()
    Object.entries(body).map(([key,value]) =>{
        if(filterFields.includes(key)){
            bodyFilter.set(key,value)
        }
    })
    return Object.fromEntries(bodyFilter)
}

exports.getOneId= (model)=>async (id,popOptions) =>{
    let query = model.findById(id)
    //if(popOptions) query = query.populate(popOptions)
    return query
}
exports.getOne= (model)=>async (filter,popOptions,selectOptions,popSelect) =>{
    let query = model.findOne(filter)
    if(selectOptions) query = query.select(selectOptions)
    if(popSelect) query = query.populate({path:popOptions,select:popSelect})
    else if(popOptions) query = query.populate(popOptions)
    return query
}
exports.getAll=(model)=>async (filter,query,popOptions)=>{
    
    const features = new APIFeatures(model.find(filter), query,popOptions).execute()
    return features
}
exports.createOne=(model)=>(body,optionsValidator)=>{

    const objectValue = new model(body)
    const filterFields= objectValue.getFields()
    const bodyFilter=exports.filterObject(body,filterFields)
    return objectValue.save(bodyFilter,optionsValidator)
    
}
exports.updateOne=(model)=>async (filter,body,selectOptions,optionsValidator)=>{

    let validator = { new: true}

    if (optionsValidator) validator = optionsValidator

    return model.findOneAndUpdate(filter,body,optionsUpdate,{ new: true}).select(selectOptions)
}
exports.deleteOne=(model)=>async (_id)=>{
    return model.findByIdAndUpdate(_id,{active:false},{ new: true })
}
exports.deleteAll=(model)=>async (property,_id)=>{
    return model.updateMany({ [property]: _id }, { $set: { active: false } });
}

exports.clearOne=(model)=>async (_id)=>{
    return model.findByIdAndDelete(_id,{ new: true })
}
exports.ActiveOne=(model)=>async (_id)=>{
    return model.findByIdAndUpdate(_id,{active:true},{ new: true })
}
exports.activeAll=(model)=>async (property,_id)=>{
    returnmodel.updateMany({ [property]: _id }, { $set: { active: true } });
}
exports.countDocuments=(model)=>async (filter)=>{
    return model.countDocuments(filter)
}
exports.getCountArrayAgregate=(model)=>async(fieldName, fieldValue,name)=>{

    return model.aggregate([
        { $match: { 
            [fieldName]: fieldValue 
        } },
        { $project: 
            { count: 
                { $size: `$${name}` 
            } 
        } }
    ])
}
exports.getModel=(model)=>{
    return new model()
}

exports.getModelConstructor=(model)=>(values)=>{
    return new model(values)
}
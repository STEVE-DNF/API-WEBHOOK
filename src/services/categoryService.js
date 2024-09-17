const categoryRepository = require('../repositories/orderManagementRepositories/categoryRepository');
const createResponse = require('./../utils/createResponse')
exports.createCategoryService = async (restaurant,name,description)=>{

    const category=await categoryRepository.createCategory({restaurant,name,description})
    if(!category) return createResponse({})
    return createResponse({success:true,data:category})
}

exports.createAllCategoryService = async (restaurant, categories) => {

    const resultCategoryDeleteAll=await categoryRepository.deleteAllCategory('restaurant',restaurant)

    const categoriesPromises = categories.map(async (value) => {
        const responseCategory = await categoryRepository.getCategory({ name: value.categorias }, "", "active");

        if (responseCategory && !responseCategory.active) {
            await categoryRepository.activeCategory(responseCategory._id);
            return { status: 'activated', category: responseCategory };
        } 
        else if (!responseCategory) {
            const newCategory = await categoryRepository.createCategory({
                restaurant,
                name: value.categorias,
                description: "Descripción"
            });
            return { status: 'created', category: newCategory };
        } 
        else {
            return { status: 'exists', category: responseCategory };
        }
    });

    const responseCategories = await Promise.all(categoriesPromises);
    return createResponse({success:true,data:responseCategories})
};


exports.updateCategoryService = async (_id,name,description)=>{

    const category=await categoryRepository.updateCategory({_id},{name,description})
    return createResponse({success:true,data:category})
}

exports.getCategoryService = async (_id,popOptions,selectOptions)=>{
    const category=await categoryRepository.getCategory({_id},popOptions,selectOptions)
    if(!category) return createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:category})
}

exports.getCategoryOneService = async (filter,popOptions,selectOptions)=>{
    const category=await categoryRepository.getCategory(filter,popOptions,selectOptions)
    return createResponse({success:true,data:category})
}

exports.getAllCategoryService = async (restaurant,query)=>{
    const category=await categoryRepository.getAllCategory({restaurant},query)
    return createResponse({success:true,data:category})
}

exports.activeCategoryService =async (_id)=>{
    const category=await categoryRepository.activeCategory(_id)
    return createResponse({success:true,data:category})
}

exports.deleteCategoryService =async (_id)=>{
    const category=await categoryRepository.deleteCategory(_id)
    return createResponse({success:true,data:category})
}

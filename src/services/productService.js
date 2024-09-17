const productRepository = require('../repositories/orderManagementRepositories/productRepository');
const categoryRepository = require('../repositories/orderManagementRepositories/categoryRepository');
const categoryService = require('../services/categoryService');
const createResponse = require('./../utils/createResponse')
exports.createProductService = async (restaurant,category,name,description,price)=>{

    const categoryVerify=await categoryService.getCategoryService(category,"","active")
    if(!categoryVerify?.active){
        return createResponse({success:false,code:'ERROR_INACTIVE'})
    }
    const product=await productRepository.createProduct({restaurant,category,name,description,price})
    if(!product) return createResponse({})
    return createResponse({success:true,data:product})
}

exports.createAllProductService = async (restaurant_id,products)=>{

    const responseCategories = categoryService.createAllCategoryService(restaurant_id,products)

    if (responseCategories.length === 0){
        return createResponse({code:'ERROR_DELETE_UPDATE_CATEGORY'})
    }

    const resultProductDeleteAll=await productRepository.deleteAllProduct('restaurant',restaurant_id)

    if (!resultProductDeleteAll.modifiedCount > 0) {
        return createResponse({code: 'NO_DOCUMENTS_DEACTIVATED'});
    }

    const productsPromises = products.map(async (value) => {
        
        const responseCategorie = await categoryService.getCategoryOneService({name:value.categorias}, "", "active");

        if (responseCategorie?.active) {

            const responseProduct=await productRepository.getProduct({name:value.productos},"", "active")

            if (responseProduct && !responseProduct?.active) {
                const getProduct = await productRepository.activeProduct(responseProduct._id);
                return { status: 'update', reason: 'Categoría inactiva o no encontrada', product: getProduct };
            } 
            else if(!responseProduct) {
                const newProduct = await productRepository.createProduct({
                    restaurant: restaurant_id,
                    category: responseCategorie._id,
                    name: value.productos,
                    description: 'Agregar nueva descripcion',
                    price: value.precios
                });
                return { status: 'created', product: newProduct };
            }
            else {
                return { status: 'exists', product: responseProduct };
            }
        } else {
            return { status: 'skipped', reason: 'Categoría inactiva o no encontrada', category: value.categorias };
        }
    });
    responseProducts = await Promise.all(productsPromises)

    if (responseProducts.length === 0){
        return createResponse({code:'ERROR_DELETE_UPDATE_PRODUCT'})
    }

    return createResponse({success:true,data:responseProducts})
}

exports.updateProductService = async (_id,category,name,description,price,max_quantity,isOutOfStock)=>{

    const categoryVerify=await categoryService.getCategoryService(category,"","active")

    if(!categoryVerify?.active){
        return createResponse({code:'ERROR_INACTIVE'})
    }
    const product=await productRepository.updateProduct({_id},{category,name,description,price,max_quantity,isOutOfStock})
    return createResponse({success:true,data:product})
}
exports.getProductService = async (_id,selectOptions)=>{

    const product=await productRepository.getProduct({_id},"category",selectOptions)
    if(!product) return createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:product})
}

exports.checkProductAvailability=async(restaurant,products)=> {

    const promises = products.map(async (product) => {
 
        const regexPattern = new RegExp(`^\\s*${product.value.replace(/\s+/g, '\\s+')}\\s*$`, 'i');

        const existProduct = await productRepository.getProduct({ restaurant,name:regexPattern,active:true,isOutOfStock:true },undefined,'_id name price max_quantity')
        if (existProduct) {
    
            let productQuantity = parseInt(product?.quantity ? product.quantity : 1);

            if (isNaN(productQuantity) || productQuantity < 0) {
                productQuantity = 0;
            }
            const quantity = productQuantity > existProduct.max_quantity 
                ? existProduct.max_quantity 
                : productQuantity;
            const total = (Math.round(existProduct.price * quantity * 100) / 100).toFixed(2);

            return { 
                ...existProduct.toObject(), 
                quantity, 
                total 
            };
        } else {
            return { code: 'ERROR_PRODUCT_INACTIVE', type: "string", placeholder: product.value };
        }
    });
    const responseProduct = await Promise.all(promises);
    return createResponse({success:true,data:responseProduct})
}



exports.getAllProductService = async (restaurant,query)=>{
    const product=await productRepository.getAllProduct({restaurant,active:true},query,"category")
    return createResponse({success:true,data:product})
}
exports.activeProductService = async (_id)=>{
    const product=await productRepository.activeProduct(_id)
    return createResponse({success:true,data:product})
}
exports.deleteProductService = async (_id)=>{
    const product=await productRepository.deleteProduct(_id)
    return createResponse({success:true,data:product})
}



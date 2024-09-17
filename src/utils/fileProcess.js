const xlsx = require('xlsx');

exports.processJsonFile = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
        try {
            const data = JSON.parse(fileBuffer.toString());
            const productos = data.productos || [];
            const categorias = data.categorias || [];
            const precios = (data.precios || []).map(precio => parseFloat(precio) || 0);
            resolve({ productos, categorias,precios });
        } catch (error) {
            reject(new Error('Error al procesar el archivo JSON'));
        }
    });
};

exports.processExcelFile = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
        try {
            const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(sheet);

            const productos = [];
            const categorias = [];
            const precios = [];
            jsonData.forEach(row => {
                if (row.productos && row.categorias && typeof row.precios !== 'undefined') {
                    productos.push(row.productos.toString().trim());
                    categorias.push(row.categorias.toString().trim());
                    precios.push(parseFloat(row.precios) || 0);
                }
            });

            resolve({ productos, categorias,precios});
        } catch (error) {
            reject(new Error('Error al procesar el archivo Excel'));
        }
    });
};

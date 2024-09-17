class APIFeatures {
  constructor(query, queryString,populateOptional) {
    this.query = query;
    this.queryString = queryString;
    this.populateString = populateOptional
  }

  async filter() {
    if(this.queryString){
      const queryObj = { ...this.queryString };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach(el => delete queryObj[el]);

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne)\b/g, match => `$${match}`);

      this.query = this.query.find(JSON.parse(queryStr));
      return this;
    }
    return this;
  }

  async sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  async limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  async paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
  async populate() {
    this.query = this.query.populate(this.populateString)
    return this;
  }
  async execute() {

    if(this.queryString){
      await this.filter()
      await this.sort()
      await this.limitFields()
      await this.paginate()
    }
    if(this.populateString){
      await this.populate()
    }
    return this.query
  }
}
module.exports = APIFeatures;

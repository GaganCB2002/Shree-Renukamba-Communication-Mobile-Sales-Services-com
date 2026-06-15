class CustomQuery {
  constructor(executor) {
    this.executor = executor;
    this.populates = [];
    this.selects = [];
    this.sorts = null;
    this.limits = null;
  }

  populate(field) {
    this.populates.push(field);
    return this;
  }

  select(fields) {
    this.selects.push(fields);
    return this;
  }

  sort(order) {
    this.sorts = order;
    return this;
  }

  limit(count) {
    this.limits = count;
    return this;
  }

  lean() {
    return this;
  }

  async then(resolve, reject) {
    try {
      const res = await this.executor({ 
        populates: this.populates, 
        selects: this.selects,
        sort: this.sorts,
        limit: this.limits
      });
      resolve(res);
    } catch (e) {
      reject(e);
    }
  }
}

module.exports = CustomQuery;

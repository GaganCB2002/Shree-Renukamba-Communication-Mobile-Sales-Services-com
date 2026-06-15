const mongoose = require('mongoose');

const searchQuerySchema = new mongoose.Schema({
  query: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resultsCount: { type: Number, default: 0 },
  found: { type: Boolean, default: false },
  searchedAt: { type: Date, default: Date.now },
});

searchQuerySchema.index({ searchedAt: -1 });
searchQuerySchema.index({ found: 1 });

const SearchQuery = mongoose.model('SearchQuery', searchQuerySchema);
module.exports = SearchQuery;

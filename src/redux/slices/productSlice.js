import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';

import { productThunk } from 'redux/thunks/productThunk';

// finding matches between multiple array by id (merge the allProductList with all filter and search lists) then sort that array
const mergeAndSortList = (type, ...sourceList) => {
    let resultList = _.intersectionBy(...sourceList, 'id');
    switch (type) {
        case 'name-ascending':
            resultList = _.sortBy(resultList, arr => arr.name);
            break;
        case 'name-descending':
            resultList = _.reverse(_.sortBy(resultList, arr => arr.name));
            break;
        case 'price-ascending':
            resultList = _.sortBy(resultList, arr => arr.price);
            break;
        case 'price-descending':
            resultList = _.reverse(_.sortBy(resultList, arr => arr.price));
            break;
        default:
    }
    return resultList;
};

const initialState = {
    allProductList: [],
    productListByCategory: {},
    featureProductList: [],
    categoryList: [],
    productById: null,
    // states of the search page
    searchResultList: [],
    filterResultByCategoryList: [],
    filterResultByPriceList: [],
    finalResultList: [],
    priceRangeList: [
        { value: 0, start: 100, end: 300 },
        { value: 1, start: 300, end: 500 },
        { value: 2, start: 500, end: 800 },
        { value: 3, start: 800, end: 1100 },
    ],
    sortBy: 'default',
    // other state
    isLoadingProduct: false,
    currentRequestIdProduct: undefined,
    // unused states
    pagingList: [],
    storeList: [],
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setSortBy: (state, { payload }) => {
            state.sortBy = payload;
        },
        setFilterResultByCategoryList: (state, { payload }) => { // payload: array of categories used to filter
            if (Array.isArray(payload) && payload.length) {
                // merge the allProductList with all filter category lists with same product 's id
                let newFilterResultList = payload?.reduce((result, category) => {
                    switch (category) {
                        case 'FEATURE': // feature list from api
                            return _.intersectionBy(result, _.cloneDeep(state.featureProductList), 'id');
                        default: // category List from api
                            return _.intersectionBy(result, _.cloneDeep(state.productListByCategory[category]), 'id');
                    }
                }, _.cloneDeep(state.allProductList));

                state.filterResultByCategoryList = newFilterResultList;
                state.finalResultList = mergeAndSortList(state.sortBy, _.cloneDeep(state.searchResultList), _.cloneDeep(state.filterResultByCategoryList), _.cloneDeep(state.filterResultByPriceList));
            } else {
                state.filterResultByCategoryList = _.cloneDeep(state.allProductList);
                state.finalResultList = mergeAndSortList(state.sortBy, _.cloneDeep(state.searchResultList), _.cloneDeep(state.filterResultByCategoryList), _.cloneDeep(state.filterResultByPriceList));
            }
        },
        setFilterResultByPriceList: (state, { payload }) => { // payload: array of values used to filter
            if (Array.isArray(payload) && payload.length) {
                // take out each product, compare with each price range (note: if the price does not exist, then count the product)
                let newFilterResultList = _.cloneDeep(state.allProductList).filter((product) => {
                    let isInRange = payload?.some(value => {
                        let priceRange = _.cloneDeep(state.priceRangeList).find(item => item.value === value);
                        if (priceRange) {
                            return _.inRange(product.price, priceRange.start, priceRange.end);
                        } else {
                            return true;
                        }
                    });
                    return isInRange;
                });
                state.filterResultByPriceList = newFilterResultList;
                state.finalResultList = mergeAndSortList(state.sortBy, _.cloneDeep(state.searchResultList), _.cloneDeep(state.filterResultByCategoryList), _.cloneDeep(state.filterResultByPriceList));
            } else {
                state.filterResultByPriceList = _.cloneDeep(state.allProductList);
                state.finalResultList = mergeAndSortList(state.sortBy, _.cloneDeep(state.searchResultList), _.cloneDeep(state.filterResultByCategoryList), _.cloneDeep(state.filterResultByPriceList));
            }
        },
        setFinalResultList: (state) => {
            state.finalResultList = mergeAndSortList(state.sortBy, _.cloneDeep(state.searchResultList), _.cloneDeep(state.filterResultByCategoryList), _.cloneDeep(state.filterResultByPriceList));
        }
    },
    extraReducers: (builder) => {
        builder
            // getAllProductList
            .addCase(productThunk.getAllProductList.fulfilled, (state, { payload }) => {
                // set initial states of all list used in filter and search
                state.allProductList = payload;
                state.searchResultList = payload;
                state.filterResultByCategoryList = payload;
                state.filterResultByPriceList = payload;
                state.finalResultList = payload;
            })
            // searchProductName
            .addCase(productThunk.searchProductName.pending, (state, { meta }) => {
                if (state.isLoadingProduct === false) {
                    state.isLoadingProduct = true;
                    state.currentRequestIdProduct = meta.requestId;
                }
            })
            .addCase(productThunk.searchProductName.fulfilled, (state, { payload, meta }) => {
                if (
                    state.isLoadingProduct === true &&
                    state.currentRequestIdProduct === meta.requestId
                ) {
                    state.isLoadingProduct = false;
                    state.currentRequestIdProduct = undefined;
                }
                state.searchResultList = payload;
                state.finalResultList = mergeAndSortList(state.sortBy, _.cloneDeep(state.searchResultList), _.cloneDeep(state.filterResultByCategoryList), _.cloneDeep(state.filterResultByPriceList));
            })
            .addCase(productThunk.searchProductName.rejected, (state, { meta }) => {
                if (
                    state.isLoadingProduct === true &&
                    state.currentRequestIdProduct === meta.requestId
                ) {
                    state.isLoadingProduct = false;
                    state.currentRequestIdProduct = undefined;
                }
            })
            // getProductByCategory
            .addCase(productThunk.getProductByCategory.fulfilled, (state, { payload }) => {
                if (payload.categoryId) {
                    state.productListByCategory = {
                        ...state.productListByCategory,
                        [payload.categoryId]: payload.data
                    };
                } else {
                    state.productListByCategory = {
                        ...state.productListByCategory,
                        default: payload.data
                    };
                }
            })
            // getProductByFeature
            .addCase(productThunk.getProductByFeature.fulfilled, (state, { payload }) => {
                if (payload.feature) {
                    state.featureProductList = payload.data;
                }
            })
            // getAllCategory
            .addCase(productThunk.getAllCategory.fulfilled, (state, { payload }) => {
                state.categoryList = payload;
            })
            // getPaging
            .addCase(productThunk.getPaging.fulfilled, (state, { payload }) => {
                state.pagingList = payload;
            })
            // getProductById
            .addCase(productThunk.getProductById.fulfilled, (state, { payload }) => {
                state.productById = payload;
            })
            // getAllStore
            .addCase(productThunk.getAllStore.fulfilled, (state, { payload }) => {
                state.storeList = payload;
            });
    }
});

export const {
    setSortBy,
    setFilterResultByCategoryList,
    setFilterResultByPriceList,
    setFinalResultList
} = productSlice.actions;

export default productSlice.reducer;
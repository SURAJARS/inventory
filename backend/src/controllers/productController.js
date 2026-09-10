import Product from '../models/Product.js';
import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';
import Brand from '../models/Brand.js';
import Unit from '../models/Unit.js';

// ===== CATEGORY =====
export const getCategories = async (req, res, next) => {
  try {
    const { isActive = true } = req.query;
    const query = isActive !== 'false' ? { isActive: true } : {};

    const categories = await Category.find(query).sort({ name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = new Category({
      name,
      description
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// ===== SUBCATEGORY =====
export const getSubCategories = async (req, res, next) => {
  try {
    const { categoryId, isActive = true } = req.query;
    const query = isActive !== 'false' ? { isActive: true } : {};

    if (categoryId) query.categoryId = categoryId;

    const subCategories = await SubCategory.find(query)
      .populate('categoryId', 'name')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: subCategories
    });
  } catch (err) {
    next(err);
  }
};

export const createSubCategory = async (req, res, next) => {
  try {
    const { name, categoryId, description } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Sub-category name and category are required'
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const subCategory = new SubCategory({
      name,
      categoryId,
      description
    });

    await subCategory.save();

    res.status(201).json({
      success: true,
      message: 'Sub-category created successfully',
      data: subCategory
    });
  } catch (err) {
    next(err);
  }
};

export const updateSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, categoryId, description, isActive } = req.body;

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Sub-category not found'
      });
    }

    if (name) subCategory.name = name;
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      subCategory.categoryId = categoryId;
    }
    if (description !== undefined) subCategory.description = description;
    if (isActive !== undefined) subCategory.isActive = isActive;

    await subCategory.save();

    res.json({
      success: true,
      message: 'Sub-category updated successfully',
      data: subCategory
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if any products use this sub-category
    const productsCount = await Product.countDocuments({ subCategoryId: id });
    
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this sub-category. It has ${productsCount} product(s) associated with it. Please delete the products first or use soft delete (toggle inactive).`
      });
    }

    const subCategory = await SubCategory.findByIdAndDelete(id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Sub-category not found'
      });
    }

    res.json({
      success: true,
      message: 'Sub-category deleted successfully',
      data: subCategory
    });
  } catch (err) {
    console.error('Error deleting sub-category:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sub-category',
      error: err.message
    });
  }
};

// ===== BRAND =====
export const getBrands = async (req, res, next) => {
  try {
    const { isActive = true } = req.query;
    const query = isActive !== 'false' ? { isActive: true } : {};

    const brands = await Brand.find(query).sort({ name: 1 });

    res.json({
      success: true,
      data: brands
    });
  } catch (err) {
    next(err);
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required'
      });
    }

    const brand = new Brand({
      name,
      description
    });

    await brand.save();

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand
    });
  } catch (err) {
    next(err);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    if (name) brand.name = name;
    if (description !== undefined) brand.description = description;
    if (isActive !== undefined) brand.isActive = isActive;

    await brand.save();

    res.json({
      success: true,
      message: 'Brand updated successfully',
      data: brand
    });
  } catch (err) {
    next(err);
  }
};

// ===== UNIT =====
export const getUnits = async (req, res, next) => {
  try {
    const { isActive = true } = req.query;
    const query = isActive !== 'false' ? { isActive: true } : {};

    const units = await Unit.find(query).sort({ code: 1 });

    res.json({
      success: true,
      data: units
    });
  } catch (err) {
    next(err);
  }
};

export const createUnit = async (req, res, next) => {
  try {
    const { code, name, description } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Unit code and name are required'
      });
    }

    const unit = new Unit({
      code: code.toUpperCase(),
      name,
      description
    });

    await unit.save();

    res.status(201).json({
      success: true,
      message: 'Unit created successfully',
      data: unit
    });
  } catch (err) {
    next(err);
  }
};

// ===== PRODUCT =====
export const getProducts = async (req, res, next) => {
  try {
    const { categoryId, subCategoryId, brandId, isActive = true } = req.query;
    const query = isActive !== 'false' ? { isActive: true } : {};

    if (categoryId) query.categoryId = categoryId;
    if (subCategoryId) query.subCategoryId = subCategoryId;
    if (brandId) query.brandId = brandId;

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('brandId', 'name')
      .populate('unitId', 'code name')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, code, categoryId, subCategoryId, brandId, unitId, minimumStockLevel } = req.body;

    if (!name || !categoryId || !subCategoryId) {
      return res.status(400).json({
        success: false,
        message: 'Product name, category, and sub-category are required'
      });
    }

    // Verify references
    const [category, subCategory] = await Promise.all([
      Category.findById(categoryId),
      SubCategory.findById(subCategoryId)
    ]);

    if (!category || !subCategory) {
      return res.status(404).json({
        success: false,
        message: 'Invalid category or sub-category'
      });
    }

    const product = new Product({
      name,
      code,
      categoryId,
      subCategoryId,
      brandId,
      unitId,
      minimumStockLevel: minimumStockLevel || 0
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, categoryId, subCategoryId, brandId, unitId, minimumStockLevel, isActive } =
      req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (name) product.name = name;
    if (code) product.code = code;
    if (categoryId) product.categoryId = categoryId;
    if (subCategoryId) product.subCategoryId = subCategoryId;
    if (brandId) product.brandId = brandId;
    if (unitId) product.unitId = unitId;
    if (minimumStockLevel !== undefined) product.minimumStockLevel = minimumStockLevel;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('brandId')
      .populate('unitId');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

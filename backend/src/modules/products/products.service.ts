import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductType } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  /**
   * Create product listing (sale/purchase/blindbox)
   */
  async createProduct(userId: number, productData: {
    title: string;
    description: string;
    images: string[];
    province: string;
    city?: string;
    price: number;
    type: ProductType;
    stock?: number;
  }): Promise<Product> {
    // Input sanitization
    const sanitizedTitle = this.sanitizeInput(productData.title);
    const sanitizedDescription = this.sanitizeInput(productData.description);

    const product = this.productsRepository.create({
      user_id: userId,
      title: sanitizedTitle,
      description: sanitizedDescription,
      images: productData.images,
      province: productData.province,
      city: productData.city,
      price: productData.price,
      type: productData.type,
      stock: productData.stock || 1,
      status: 1,
    });

    return await this.productsRepository.save(product);
  }

  /**
   * Get product list with filters
   */
  async getProducts(filters: {
    type?: ProductType;
    province?: string;
    status?: number;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const { type, province, status = 1, page = 1, limit = 20 } = filters;

    const query = this.productsRepository.createQueryBuilder('product')
      .where('product.status = :status', { status });

    if (type) {
      query.andWhere('product.type = :type', { type });
    }

    if (province) {
      query.andWhere('product.province = :province', { province });
    }

    query.orderBy('product.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [products, total] = await query.getManyAndCount();

    return { products, total };
  }

  /**
   * Get product detail
   */
  async getProductById(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  /**
   * Get user's products
   */
  async getUserProducts(userId: number): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Update product
   */
  async updateProduct(productId: number, userId: number, updateData: Partial<Product>): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id: productId, user_id: userId },
    });

    if (!product) {
      throw new NotFoundException('Product not found or unauthorized');
    }

    // Sanitize text inputs
    if (updateData.title) {
      updateData.title = this.sanitizeInput(updateData.title);
    }
    if (updateData.description) {
      updateData.description = this.sanitizeInput(updateData.description);
    }

    Object.assign(product, updateData);
    return await this.productsRepository.save(product);
  }

  /**
   * Delete product (soft delete by changing status)
   */
  async deleteProduct(productId: number, userId: number): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id: productId, user_id: userId },
    });

    if (!product) {
      throw new NotFoundException('Product not found or unauthorized');
    }

    product.status = 2; // off shelf
    await this.productsRepository.save(product);
  }

  /**
   * Basic input sanitization to prevent XSS
   */
  private sanitizeInput(input: string): string {
    if (!input) return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

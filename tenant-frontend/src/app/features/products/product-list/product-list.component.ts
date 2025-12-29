import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, CartService, AuthService } from '../../../core/services';
import { Product, ProductFilter, Brand, Category } from '../../../core/models';
import { ProductFilterComponent } from '../product-filter/product-filter.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductFilterComponent],
  template: `
    <div class="flex min-h-screen bg-gray-50">
      <!-- Sidebar Filter -->
      <app-product-filter
        [brands]="brands()"
        [categories]="categories()"
        (filtersChanged)="onFilterChange($event)"
      />

      <!-- Product Grid -->
      <main class="flex-1 p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Products</h1>
            <p class="text-gray-500 mt-1">{{ totalProducts() }} products found</p>
          </div>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        } @else {
          <!-- Product Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (product of products(); track product.id) {
              <div class="card p-4 flex flex-col">
                <div class="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>

                <div class="flex-1">
                  @if (product.brand) {
                    <p class="text-xs text-primary-600 font-medium mb-1">{{ product.brand.name }}</p>
                  }
                  <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">{{ product.name }}</h3>
                  <p class="text-sm text-gray-500 mb-2">SKU: {{ product.sku }}</p>
                  
                  @if (product.is_in_stock) {
                    <span class="badge-success">In Stock ({{ product.stock_quantity }})</span>
                  } @else {
                    <span class="badge-danger">Out of Stock</span>
                  }
                </div>

                <div class="mt-4 pt-4 border-t border-gray-100">
                  <div class="flex justify-between items-center mb-3">
                    <div>
                      <span class="text-lg font-bold text-gray-900">\${{ product.price_usd | number:'1.2-2' }}</span>
                      <span class="text-sm text-gray-500 ml-2">€{{ product.price_eur | number:'1.2-2' }}</span>
                    </div>
                  </div>

                  @if (!isAdmin()) {
                    <button 
                      (click)="addToCart(product)"
                      [disabled]="!product.is_in_stock || addingToCart() === product.id"
                      class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                      @if (addingToCart() === product.id) {
                        <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      }
                      Sepete Ekle
                    </button>
                  } @else {
                    <button 
                      (click)="confirmDelete(product)"
                      [disabled]="deletingProduct() === product.id"
                      class="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">
                      @if (deletingProduct() === product.id) {
                        <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      }
                      🗑️ Sil
                    </button>
                  }
                </div>
              </div>
            } @empty {
              <div class="col-span-full text-center py-12">
                <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p class="text-gray-500">Try adjusting your filters</p>
              </div>
            }
          </div>

          @if (totalPages() > 1) {
            <div class="flex justify-center mt-8 gap-2">
              <button 
                (click)="goToPage(currentPage() - 1)"
                [disabled]="currentPage() === 1"
                class="btn-secondary disabled:opacity-50">
                Previous
              </button>
              <span class="px-4 py-2 text-gray-600">
                Page {{ currentPage() }} of {{ totalPages() }}
              </span>
              <button 
                (click)="goToPage(currentPage() + 1)"
                [disabled]="currentPage() === totalPages()"
                class="btn-secondary disabled:opacity-50">
                Next
              </button>
            </div>
          }
        }
      </main>
    </div>

    <!-- Delete Confirmation Modal -->
    @if (productToDelete()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
          <h2 class="text-xl font-bold text-red-600 mb-4">⚠️ Ürün Silme</h2>
          <p class="text-gray-700 mb-6">
            <strong>{{ productToDelete()!.name }}</strong> ürününü silmek istediğinize emin misiniz?
            <br><br>
            <span class="text-red-500 text-sm">Bu işlem geri alınamaz!</span>
          </p>
          <div class="flex justify-end gap-3">
            <button (click)="cancelDelete()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              İptal
            </button>
            <button (click)="deleteProduct()" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Evet, Sil
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  isAdmin = this.authService.isAdmin;

  products = signal<Product[]>([]);
  brands = this.productService.brands;
  categories = this.productService.categories;
  loading = signal(true);
  addingToCart = signal<string | null>(null);
  deletingProduct = signal<string | null>(null);
  productToDelete = signal<Product | null>(null);

  currentPage = signal(1);
  totalPages = signal(1);
  totalProducts = signal(0);

  private currentFilter: ProductFilter = {};

  ngOnInit(): void {
    this.loadFilters();
    this.loadProducts();
  }

  loadFilters(): void {
    this.productService.getBrands().subscribe();
    this.productService.getCategories().subscribe();
  }

  loadProducts(): void {
    this.loading.set(true);

    this.productService.getProducts({
      ...this.currentFilter,
      page: this.currentPage()
    }).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.totalPages.set(response.last_page);
        this.totalProducts.set(response.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(filter: ProductFilter): void {
    this.currentFilter = filter;
    this.currentPage.set(1);
    this.loadProducts();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  addToCart(product: Product): void {
    this.addingToCart.set(product.id);

    this.cartService.addItem({ product_id: product.id }).subscribe({
      next: () => this.addingToCart.set(null),
      error: () => this.addingToCart.set(null)
    });
  }

  confirmDelete(product: Product): void {
    this.productToDelete.set(product);
  }

  cancelDelete(): void {
    this.productToDelete.set(null);
  }

  deleteProduct(): void {
    const product = this.productToDelete();
    if (!product) return;

    this.productToDelete.set(null);
    this.deletingProduct.set(product.id);

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.deletingProduct.set(null);
        this.loadProducts();
      },
      error: (err) => {
        this.deletingProduct.set(null);
        const message = err.error?.message || err.message || 'Bilinmeyen hata';
        alert('Ürün silinemedi: ' + message);
      }
    });
  }
}

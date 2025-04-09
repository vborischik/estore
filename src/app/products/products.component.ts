import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProductService, Product, ProductResponse } from '../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatPaginatorModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['productID', 'productName', 'price', 'stockQuantity', 'sku', 'upc', 'actions'];

  editForm!: FormGroup;
  dialogRef!: MatDialogRef<any>;
  isLoading = false;
  isDialogLoading = false;
  totalCount: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  @ViewChild('editDialogTemplate') editDialogTemplate!: any;
  @ViewChild('deleteDialogTemplate') deleteDialogTemplate!: any;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts(this.pageIndex + 1, this.pageSize)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.products = response.products;
          this.totalCount = response.totalCount;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.showError('Failed to load products');
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadProducts();
  }

  openAddDialog(): void {
    this.editForm = this.fb.group({
      productID: [0],
      productName: ['', Validators.required],
      categoryID: [1, Validators.required],
      price: [0],
      stockQuantity: [0],
      imageURL: [''],
      upc: ['', Validators.required],
      sku: ['', Validators.required],
    });

    this.dialogRef = this.dialog.open(this.editDialogTemplate, {
      width: '400px',
      disableClose: true,
      data: { isNewProduct: true }
    });
  }

  editProduct(product: Product): void {
    this.editForm = this.fb.group({
      productID: [product.productID],
      productName: [product.productName, Validators.required],
      categoryID: [product.categoryID, Validators.required],
      price: [product.price],
      stockQuantity: [product.stockQuantity],
      imageURL: [product.imageURL],
      upc: [product.upc, Validators.required],
      sku: [product.sku, Validators.required],
    });

    this.dialogRef = this.dialog.open(this.editDialogTemplate, {
      width: '400px',
      disableClose: true,
      data: product
    });
  }

  deleteProduct(product: Product): void {
    this.dialogRef = this.dialog.open(this.deleteDialogTemplate, {
      width: '300px',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.productService.deleteProduct(product.productID)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.loadProducts();
              this.showSuccess('Product deleted successfully');
            },
            error: (error) => {
              console.error('Error deleting product:', error);
              this.showError('Failed to delete product');
            }
          });
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitForm(): void {
    if (this.editForm.invalid) return;

    this.isDialogLoading = true;
    const formValue = this.editForm.value;
    const request$ = formValue.productID === 0
      ? this.productService.addProduct(formValue)
      : this.productService.updateProduct(formValue);

    request$
      .pipe(finalize(() => this.isDialogLoading = false))
      .subscribe({
        next: () => {
          this.dialogRef.close();
          this.loadProducts();
          this.showSuccess(formValue.productID === 0 ? 'Product added successfully' : 'Product updated successfully');
        },
        error: (error) => {
          console.error('Error submitting product:', error);
          this.showError('Failed to submit product');
        }
      });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}

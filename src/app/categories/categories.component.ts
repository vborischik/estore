import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CategoryService, Category, CategoryResponse } from '../services/category.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-categories',
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
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
})
export class CategoriesComponent implements OnInit, AfterViewInit {
  // Use MatTableDataSource for data manipulation
  dataSource = new MatTableDataSource<Category>([]);
  displayedColumns: string[] = ['categoryID', 'categoryName', 'actions'];
  editForm: FormGroup;
  dialogRef!: MatDialogRef<any>;
  isLoading = false;
  isDialogLoading = false;

  // Pagination properties
  totalCount: number = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('editDialogTemplate', { static: true }) editDialogTemplate: any;
  @ViewChild('deleteDialogTemplate', { static: true }) deleteDialogTemplate: any;

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      categoryID: [0],
      categoryName: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    // Connect sort to dataSource
    this.dataSource.sort = this.sort;
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories(this.pageIndex + 1, this.pageSize)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.categories;
          this.totalCount = response.totalCount;
        },
        error: (error) => {
          console.error('Error loading categories', error);
          this.showError('Failed to load categories');
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadCategories();
  }

  openAddDialog(): void {
    // Reset the form completely
    this.editForm.reset({
      categoryID: 0,
      categoryName: ''
    });

    // Open the dialog
    this.dialogRef = this.dialog.open(this.editDialogTemplate, {
      width: '400px',
      disableClose: true
    });
  }

  editCategory(category: Category): void {
    // Populate form with existing data
    this.editForm.setValue({
      categoryID: category.categoryID,
      categoryName: category.categoryName
    });

    this.dialogRef = this.dialog.open(this.editDialogTemplate, {
      width: '400px',
      disableClose: true
    });
  }

  submitForm(): void {
    if (this.editForm.valid) {
      const formData = this.editForm.value;
      const isNewCategory = formData.categoryID === 0;

      this.isDialogLoading = true;

      const submitAction = isNewCategory
        ? this.categoryService.addCategory({ categoryName: formData.categoryName })
        : this.categoryService.updateCategory(formData);

      submitAction
        .pipe(
          finalize(() => this.isDialogLoading = false)
        )
        .subscribe({
          next: (response) => {
            if (response && response.categoryID) {
              this.dialogRef.close();
              this.loadCategories();
              this.showSuccess(
                isNewCategory
                  ? 'Category added successfully'
                  : 'Category updated successfully'
              );
            } else if (typeof response === 'string') {
              this.showError(response);
            }
          },
          error: (error) => {
            const errorMessage =
              (error.error && typeof error.error === 'string')
              ? error.error
              : (error.error?.message || error.message || 'Failed to process category');

            this.showError(errorMessage);
          }
        });
    }
  }

  deleteCategory(category: Category): void {
    this.dialogRef = this.dialog.open(this.deleteDialogTemplate, {
      width: '300px',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;

        this.categoryService.deleteCategory(category.categoryID)
          .pipe(
            finalize(() => this.isLoading = false)
          )
          .subscribe({
            next: () => {
              this.loadCategories();
              this.showSuccess('Category deleted successfully');
            },
            error: (error) => {
              console.error('Error deleting category:', error);
              this.showError('Failed to delete category');
            }
          });
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

  closeDialog(): void {
    this.dialogRef.close();
  }
}
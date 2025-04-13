import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { OrderService, Order, OrderDetail } from '../services/order.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, Observable, of } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { environment } from '../../enviroments/environment';

interface OrderStatus {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Customer {
  id: number;
  name: string;
}

@Component({
  selector: 'app-orders',
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
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatAutocompleteModule,
    NgxMatSelectSearchModule
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  orderDetails: OrderDetail[] = [];
  displayedColumns: string[] = ['orderID', 'customerName', 'orderDate', 'orderStatus', 'actions'];
  detailsDisplayedColumns: string[] = ['productID', 'quantity', 'unitPrice', 'total', 'actions'];
  editForm: FormGroup;
  dialogRef!: MatDialogRef<any>;
  isLoading = false;
  isDialogLoading = false;
  totalCount: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  selectedOrder: Order | null = null;
  orderStatuses: OrderStatus[] = [];
  products: Product[] = [];
  customers: Customer[] = [];
  filteredProducts: Observable<Product[]> = of([]);
  customerSearchCtrl = '';
  productSearchCtrl = '';

  @ViewChild('editDialogTemplate') editDialogTemplate: any;
  @ViewChild('deleteDialogTemplate') deleteDialogTemplate: any;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.editForm = this.fb.group({
      orderID: [0, Validators.required],
      customerID: ['', Validators.required],
      customerName: ['', Validators.required],
      orderDate: [null, Validators.required],
      orderStatus: ['', Validators.required],
      orderTime: ['00:00']
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.loadOrderStatuses();
    this.loadProducts();
    this.loadCustomers();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getOrders(this.pageIndex + 1, this.pageSize)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.orders = response.orders;
          this.totalCount = response.totalCount;
        },
        error: (error) => {
          console.error('Error loading orders', error);
          this.showError('Failed to load orders');
        }
      });
  }

  loadOrderStatuses(): void {
    this.http.get<OrderStatus[]>(`${environment.apiUrl}/orders/statuses`)
      .subscribe({
        next: (statuses) => {
          this.orderStatuses = statuses;

          const pendingStatus = this.orderStatuses.find(s => s.name.toLowerCase() === 'pending');
          if (pendingStatus && this.editForm.get('orderID')?.value === 0) {
            this.editForm.patchValue({ orderStatus: pendingStatus.id });
          }



          if (this.editForm.get('orderID')?.value === 0) {
            const pendingStatus = statuses.find(s => s.name.toLowerCase() === 'pending');
            if (pendingStatus) {
              this.editForm.patchValue({ orderStatus: pendingStatus.name });
            }
          }

        },
        error: (error) => {
          console.error('Error loading order statuses', error);
        }
      });




  }



  loadProducts(): void {
    this.http.get<Product[]>(`${environment.apiUrl}/products/list`)
      .subscribe({
        next: (products) => {
          this.products = products;
        },
        error: (error) => {
          console.error('Error loading products', error);
        }
      });
  }

  loadCustomers(): void {
    this.http.get<Customer[]>(`${environment.apiUrl}/customers/list`)
      .subscribe({
        next: (customers) => {
          this.customers = customers;
        },
        error: (error) => {
          console.error('Error loading customers', error);
        }
      });
  }

  filterProducts(): Product[] {
    if (!this.productSearchCtrl) return this.products;
    const filterValue = this.productSearchCtrl.toLowerCase();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(filterValue));
  }

  filterCustomers(): Customer[] {
    if (!this.customerSearchCtrl) return this.customers;
    const filterValue = this.customerSearchCtrl.toLowerCase();
    return this.customers.filter(customer =>
      customer.name.toLowerCase().includes(filterValue));
  }

  loadOrderDetails(orderID: number): void {
    this.isDialogLoading = true;
    this.orderService.getOrderDetails(orderID)
      .pipe(finalize(() => this.isDialogLoading = false))
      .subscribe({
        next: (details) => {
          this.orderDetails = details;
        },
        error: (error) => {
          console.error('Error loading order details', error);
          this.showError('Failed to load order details');
        }
      });
  }

  editOrder(order: Order): void {
    this.editForm.setValue({
      orderID: order.orderID,
      customerID: order.customerID,
      customerName: order.customerName,
      orderDate: new Date(order.orderDate),
      orderStatus: order.orderStatus,
      orderTime: this.formatTime(new Date(order.orderDate))
    });

    this.dialogRef = this.dialog.open(this.editDialogTemplate, {
      minWidth: '1900px',
      disableClose: true,
      data: order
    });

    this.selectedOrder = order;
    this.loadOrderDetails(order.orderID);
  }

  formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  openAddDialog(): void {
    this.editForm.reset();

    const now = new Date();

    const pendingStatus = this.orderStatuses.find(s => s.name.toLowerCase() === 'pending');
    this.editForm.patchValue({
      orderID: 0,
      orderDate: now,
      orderTime: this.formatTime(now),
      orderStatus: pendingStatus?.name || ''
    });

    this.orderDetails = [];

    this.dialogRef = this.dialog.open(this.editDialogTemplate, {
      minWidth: '1900px',
      disableClose: true,
      data: { isNewOrder: true }
    });
  }

  addNewDetail(): void {
    const newDetail: OrderDetail = {
      orderDetailID: 0,
      orderID: this.editForm.get('orderID')?.value || 0,
      productID: 0,
      productName: '',
      quantity: 1,
      unitPrice: 0,
      sku: ''
    };
    this.orderDetails = [...this.orderDetails, newDetail]; // Create a new array to trigger change detection
  }

  removeDetail(detail: OrderDetail): void {
    this.orderDetails = this.orderDetails.filter(d => d !== detail);
  }

  getProductName(productId: number): string {
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : '';
  }

  onProductSelected(detail: OrderDetail, productId: number): void {
    detail.productID = productId;
    const product = this.products.find(p => p.id === productId);
    if (product) {
      detail.productName = product.name;
      detail.unitPrice = product.price; // Set the price from the product data
    }
  }

  onCustomerSelected(customerId: number): void {
    const customer = this.customers.find(c => c.id === customerId);
    if (customer) {
      this.editForm.patchValue({
        customerID: customer.id,
        customerName: customer.name
      });
    }
  }

  saveFullOrder(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
      return;
    }

    // Check if order has at least one product
    if (this.orderDetails.length === 0) {
      this.showError('Please add at least one product to the order');
      return;
    }

    const formValue = this.editForm.value;
    const date: Date = formValue.orderDate instanceof Date ? new Date(formValue.orderDate) : new Date();

    // Split the time string and set the hours and minutes
    if (formValue.orderTime) {
      const [hours, minutes] = formValue.orderTime.split(':').map(Number);
      date.setHours(hours);
      date.setMinutes(minutes);
    }

    const order = {
      ...formValue,
      orderDate: date.toISOString()
    };

    this.isDialogLoading = true;

    const save$ = order.orderID === 0
      ? this.orderService.createOrder(order)
      : this.orderService.updateOrder(order);

    save$.pipe(finalize(() => this.isDialogLoading = false)).subscribe({
      next: (savedOrder: Order) => {
        this.dialogRef.close();
        this.loadOrders();
        this.showSuccess('Order saved successfully');

        // Use the orderID from the saved order
        const orderID = savedOrder.orderID;

        // Set the orderID for all details before saving them
        this.orderDetails.forEach(detail => detail.orderID = orderID);

        // Continue saving details with updated orderIDs
        const detailPromises = this.orderDetails.map(detail => {
          if (detail.orderDetailID === 0) {
            return this.orderService.addOrderDetail(orderID, detail).toPromise();
          } else {
            return this.orderService.updateOrderDetail(detail).toPromise();
          }
        });

        Promise.all(detailPromises).catch(err => {
          console.error(err);
          this.showError('Some order details may not have been saved');
        });
      },
      error: (err) => {
        console.error(err);
        this.showError('Failed to save order');
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  deleteOrder(order: Order): void {
    this.dialogRef = this.dialog.open(this.deleteDialogTemplate, {
      width: '300px',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.orderService.deleteOrder(order.orderID)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.loadOrders();
              this.showSuccess('Order deleted successfully');
            },
            error: (error) => {
              console.error('Error deleting order:', error);
              this.showError('Failed to delete order');
            }
          });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadOrders();
  }

  closeDialog(): void {
    this.dialogRef.close();
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
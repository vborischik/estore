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
import { finalize } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';

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
    MatPaginatorModule
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  orderDetails: OrderDetail[] = [];
  displayedColumns: string[] = ['orderID', 'customerID', 'customerName', 'orderDate', 'orderStatus', 'actions'];
  detailsDisplayedColumns: string[] = ['orderDetailID', 'productID', 'productName', 'quantity', 'price', 'actions'];
  editForm: FormGroup;
  editDetailForm: FormGroup;
  dialogRef!: MatDialogRef<any>;
  isLoading = false;
  isDialogLoading = false;
  totalCount: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  selectedOrder: Order | null = null;

  @ViewChild('editDialogTemplate') editDialogTemplate: any;
  @ViewChild('deleteDialogTemplate') deleteDialogTemplate: any;
  @ViewChild('orderDetailsDialogTemplate') orderDetailsDialogTemplate: any;
  @ViewChild('editDetailDialogTemplate') editDetailDialogTemplate: any;
  @ViewChild('deleteDetailDialogTemplate') deleteDetailDialogTemplate: any;

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
      orderDate: ['', Validators.required],
      orderStatus: ['', Validators.required]
    });

    this.editDetailForm = this.fb.group({
      orderDetailID: [0],
      orderID: ['', Validators.required],
      productID: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getOrders(this.pageIndex + 1, this.pageSize)
      .pipe(
        finalize(() => this.isLoading = false)
      )
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

  loadOrderDetails(orderID: number): void {
    this.isDialogLoading = true;
    this.orderService.getOrderDetails(orderID)
      .pipe(
        finalize(() => this.isDialogLoading = false)
      )
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
    // First, immediately open dialog with table data
    this.editForm.setValue({
      orderID: order.orderID,
      customerID: order.customerID,
      orderDate: order.orderDate,
      orderStatus: order.orderStatus
    });

    this.dialogRef = this.dialog.open(this.editDialogTemplate, {
      width: '400px',
      disableClose: true,
      data: order
    });

    // Then, fetch fresh data in the background
    this.isDialogLoading = true;

    // Load the order data first
    this.orderService.getOrderById(order.orderID)
      .pipe(
        finalize(() => {
          // After order data is loaded, load details
          this.loadOrderDetails(order.orderID);
        })
      )
      .subscribe({
        next: (freshOrder) => {
          // Only update form if dialog is still open
          if (this.dialogRef && this.dialogRef.getState() === 0) {
            this.editForm.setValue({
              orderID: freshOrder.orderID,
              customerID: freshOrder.customerID,
              orderDate: freshOrder.orderDate,
              orderStatus: freshOrder.orderStatus
            });
          }
        },
        error: (error) => {
          console.error('Error fetching order details:', error);
          this.showError('Failed to get latest order data');
          this.isDialogLoading = false; // Ensure loading state is cleared on error
        }
      });
  }

  showOrderDetails(order: Order): void {
    this.selectedOrder = order;

    this.dialogRef = this.dialog.open(this.orderDetailsDialogTemplate, {
      width: '800px',
      disableClose: false,
      data: order
    });

    // Load order details when dialog opens
    this.loadOrderDetails(order.orderID);
  }

  closeDialog(): void {
    this.dialogRef.close();
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
          .pipe(
            finalize(() => this.isLoading = false)
          )
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

  openAddDialog(): void {
    this.editForm.reset();
    this.editForm.patchValue({
      orderID: 0
    });

    this.dialogRef = this.dialog.open(this.editDialogTemplate, {
      width: '400px',
      disableClose: true,
      data: { isNewOrder: true }
    });
  }

  openAddDetailDialog(): void {
    if (!this.selectedOrder) return;

    this.editDetailForm.reset();
    this.editDetailForm.patchValue({
      orderDetailID: 0,
      orderID: this.selectedOrder.orderID
    });

    this.dialogRef = this.dialog.open(this.editDetailDialogTemplate, {
      width: '400px',
      disableClose: true,
      data: { isNewDetail: true }
    });
  }

  editOrderDetail(detail: OrderDetail): void {
    this.editDetailForm.setValue({
      orderDetailID: detail.orderDetailID,
      orderID: detail.orderID,
      productID: detail.productID,
      quantity: detail.quantity,
      price: detail.price
    });

    this.dialogRef = this.dialog.open(this.editDetailDialogTemplate, {
      width: '400px',
      disableClose: true,
      data: detail
    });
  }

  deleteOrderDetail(detail: OrderDetail): void {
    this.dialogRef = this.dialog.open(this.deleteDetailDialogTemplate, {
      width: '300px',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isDialogLoading = true;

        this.orderService.deleteOrderDetail(detail.orderDetailID)
          .pipe(
            finalize(() => this.isDialogLoading = false)
          )
          .subscribe({
            next: () => {
              if (this.selectedOrder) {
                this.loadOrderDetails(this.selectedOrder.orderID);
              }
              this.showSuccess('Order detail deleted successfully');
            },
            error: (error) => {
              console.error('Error deleting order detail:', error);
              this.showError('Failed to delete order detail');
            }
          });
      }
    });
  }

  submitOrderForm(): void {
    if (this.editForm.valid) {
      const formData = this.editForm.value;
      this.isDialogLoading = true;

      if (formData.orderID === 0) {
        // For new order
        const { orderID, ...orderData } = formData;

        this.orderService.createOrder(orderData)
          .pipe(
            finalize(() => this.isDialogLoading = false)
          )
          .subscribe({
            next: (response) => {
              if (response && response.orderID) {
                this.dialogRef.close();
                this.loadOrders();
                this.showSuccess('Order added successfully');
              } else if (typeof response === 'string') {
                this.showError(response);
              }
            },
            error: (error) => {
              let errorMessage = 'Failed to add order';
              if (error.error && typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error && error.error.message) {
                errorMessage = error.error.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              this.showError(errorMessage);
            }
          });
      } else {
        // For existing order
        // Since updateOrder is not available in the provided service, we need to implement it
        // We'll use HTTP PUT directly here as a workaround
        const order = formData as Order;

        this.http.put<Order>(`${this.orderService.apiUrl}/${order.orderID}`, order)
          .pipe(
            finalize(() => this.isDialogLoading = false)
          )
          .subscribe({
            next: (response) => {
              if (response && response.orderID) {
                this.dialogRef.close();
                this.loadOrders();
                this.showSuccess('Order updated successfully');
              } else if (typeof response === 'string') {
                this.showError(response);
              }
            },
            error: (error) => {
              let errorMessage = 'Failed to update order';
              if (error.error && typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error && error.error.message) {
                errorMessage = error.error.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              this.showError(errorMessage);
            }
          });
      }
    }
  }

  submitDetailForm(): void {
    if (this.editDetailForm.valid) {
      const formData = this.editDetailForm.value;
      this.isDialogLoading = true;

      if (formData.orderDetailID === 0) {
        // For new order detail
        const { orderDetailID, ...detailData } = formData;

        this.orderService.addOrderDetail(formData.orderID, detailData)
          .pipe(
            finalize(() => this.isDialogLoading = false)
          )
          .subscribe({
            next: (response) => {
              if (response && response.orderDetailID) {
                this.dialogRef.close();
                if (this.selectedOrder) {
                  this.loadOrderDetails(this.selectedOrder.orderID);
                }
                this.showSuccess('Order detail added successfully');
              } else if (typeof response === 'string') {
                this.showError(response);
              }
            },
            error: (error) => {
              let errorMessage = 'Failed to add order detail';
              if (error.error && typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error && error.error.message) {
                errorMessage = error.error.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              this.showError(errorMessage);
            }
          });
      } else {
        // For existing order detail
        this.orderService.updateOrderDetail(formData)
          .pipe(
            finalize(() => this.isDialogLoading = false)
          )
          .subscribe({
            next: (response) => {
              this.dialogRef.close();
              if (this.selectedOrder) {
                this.loadOrderDetails(this.selectedOrder.orderID);
              }
              this.showSuccess('Order detail updated successfully');
            },
            error: (error) => {
              let errorMessage = 'Failed to update order detail';
              if (error.error && typeof error.error === 'string') {
                errorMessage = error.error;
              } else if (error.error && error.error.message) {
                errorMessage = error.error.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              this.showError(errorMessage);
            }
          });
      }
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadOrders();
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
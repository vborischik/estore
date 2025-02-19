import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CustomerService } from '../services/customer.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

interface Customer {
  customerID: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

@Component({
  selector: 'app-customers',
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
    ReactiveFormsModule
  ],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
})
export class CustomersComponent implements OnInit {
  customers: any[] = [];
  displayedColumns: string[] = ['customerID', 'firstName', 'lastName', 'phone', 'email', 'actions'];
  editForm: FormGroup;
  dialogRef!: MatDialogRef<any>;
  isLoading = false;
  isDialogLoading = false; // Separate loading state for dialog operations

  @ViewChild('editDialogTemplate') editDialogTemplate: any;
  @ViewChild('deleteDialogTemplate') deleteDialogTemplate: any;

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.fb.group({
      customerID: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getAllCustomers()
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => (this.customers = data),
        error: (error) => {
          console.error('Error fetching customers:', error);
          this.showError('Failed to load customers');
        },
      });
  }

  editCustomer(customer: Customer): void {
    // First, immediately open dialog with table data to avoid visible delay
    this.editForm.setValue({
      customerID: customer.customerID,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email,
    });

    this.dialogRef = this.dialog.open(this.editDialogTemplate, {
      width: '400px',
      disableClose: true,
      data: customer
    });

    // Then, fetch fresh data in the background
    this.isDialogLoading = true;
    this.customerService.getCustomerById(customer.customerID)
      .pipe(
        finalize(() => this.isDialogLoading = false)
      )
      .subscribe({
        next: (freshCustomer) => {
          // Only update form if dialog is still open
          if (this.dialogRef && this.dialogRef.getState() === 0) { // 0 = open
            this.editForm.setValue({
              customerID: freshCustomer.customerID,
              firstName: freshCustomer.firstName,
              lastName: freshCustomer.lastName,
              phone: freshCustomer.phone,
              email: freshCustomer.email,
            });
          }
        },
        error: (error) => {
          console.error('Error fetching customer details:', error);
          this.showError('Failed to get latest customer data');
        }
      });

    // We don't subscribe to afterClosed here anymore
    // The submitForm method will handle the API call and dialog closure
  }

  // updateCustomer(updatedCustomer: Customer): void {
  //   this.isLoading = true;

  //   this.customerService.updateCustomer(updatedCustomer)
  //     .pipe(
  //       finalize(() => this.isLoading = false)
  //     )
  //     .subscribe({
  //       next: (response) => {

  //         this.loadCustomers();
  //         this.showSuccess('Customer updated successfully');
  //       },
  //       error: (error) => {

  //         this.showError('Failed to update customer');
  //       }
  //     });
  // }

  closeDialog(): void {
    this.dialogRef.close();
  }

  deleteCustomer(customer: Customer): void {
    this.dialogRef = this.dialog.open(this.deleteDialogTemplate, {
      width: '300px',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;

        this.customerService.deleteCustomer(customer.customerID)
          .pipe(
            finalize(() => this.isLoading = false)
          )
          .subscribe({
            next: () => {
              console.log('Customer deleted successfully');
              this.loadCustomers();
              this.showSuccess('Customer deleted successfully');
            },
            error: (error) => {
              console.error('Error deleting customer:', error);
              this.showError('Failed to delete customer');
            }
          });
      }
    });
  }

  openAddDialog(): void {
    this.editForm.reset();
    this.editForm.patchValue({
      customerID: 0
    });

    this.dialogRef = this.dialog.open(this.editDialogTemplate, {
      width: '400px',
      disableClose: true,
      data: { isNewCustomer: true }
    });

    // We don't subscribe to afterClosed here anymore
    // The submitForm method will handle the API call and dialog closure
  }

  // addCustomer(newCustomer: any): void {
  //   this.isLoading = true;
  //   const { customerID, ...customerData } = newCustomer;

  //   this.customerService.addCustomer(customerData)
  //     .pipe(
  //       finalize(() => this.isLoading = false)
  //     )
  //     .subscribe({
  //       next: (response) => {
  //         console.log('Customer added successfully', response);
  //         this.loadCustomers();
  //         this.showSuccess('Customer added successfully');
  //       },
  //       error: (error) => {
  //         console.error('Error adding customer:', error);
  //         this.showError('Failed to add customer');
  //       }
  //     });
  // }

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


  submitForm(): void {
    if (this.editForm.valid) {
      const formData = this.editForm.value;
      if (formData.customerID === 0) {
        // For new customer
        const { customerID, ...customerData } = formData;
        this.isDialogLoading = true;

        this.customerService.addCustomer(customerData)
          .pipe(
            finalize(() => this.isDialogLoading = false)
          )
          .subscribe({
            next: (response) => {
              // Check if the response has customerID (successful response)
              if (response && response.customerID) {
                console.log('Customer added successfully', response);
                this.dialogRef.close();
                this.loadCustomers();
                this.showSuccess('Customer added successfully');
              } else if (typeof response === 'string') {
                // Handle string error response (e.g. "email or phone already used")
                this.showError(response);
              }
            },
            error: (error) => {
              //console.error('Error adding customer:', error);
              // Extract error message from the response
              let errorMessage = 'Failed to add customer';
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
        // For existing customer
        this.isDialogLoading = true;

        this.customerService.updateCustomer(formData)
          .pipe(
            finalize(() => this.isDialogLoading = false)
          )
          .subscribe({
            next: (response) => {
              // Check if the response has customerID (successful response)
              if (response && response.customerID) {
                //console.log('Customer updated successfully', response);
                this.dialogRef.close();
                this.loadCustomers();
                this.showSuccess('Customer updated successfully');
              } else if (typeof response === 'string') {
                // Handle string error response (e.g. "Phone or Email already used")
                this.showError(response);
              }
            },
            error: (error) => {
              //console.error('Error updating customer:', error);
              // Extract error message from the response
              let errorMessage = 'Failed to update customer';
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


}
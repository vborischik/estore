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

  @ViewChild('editDialogTemplate') editDialogTemplate: any;
  @ViewChild('deleteDialogTemplate') deleteDialogTemplate: any;

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog,
    private fb: FormBuilder
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
        error: (error) => console.error('Error fetching customers:', error),
      });
  }

  openEditDialog(customer: Customer): void {
    this.isLoading = true;

    // Получаем актуальные данные перед открытием диалога
    this.customerService.getCustomerById(customer.customerID)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (freshCustomer) => {
          this.editForm.setValue({
            customerID: freshCustomer.customerID,
            firstName: freshCustomer.firstName,
            lastName: freshCustomer.lastName,
            phone: freshCustomer.phone,
            email: freshCustomer.email,
          });

          this.dialogRef = this.dialog.open(this.editDialogTemplate, {
            width: '400px',
            disableClose: true,
            data: freshCustomer
          });

          this.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.updateCustomer(result);
            }
          });
        },
        error: (error) => {
          console.error('Error fetching customer details:', error);
          // Здесь можно добавить показ сообщения об ошибке пользователю
        }
      });
  }


  updateCustomer(updatedCustomer: Customer): void {
    this.isLoading = true;

    this.customerService.updateCustomer(updatedCustomer)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Customer updated successfully', response);
          this.loadCustomers();
        },
        error: (error) => {
          console.error('Error updating customer:', error);
          // Здесь можно добавить показ сообщения об ошибке пользователю
        }
      });
  }

  editCustomer(customer: Customer): void {
    this.isLoading = true;


    this.customerService.getCustomerById(customer.customerID)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (freshCustomer) => {
          this.editForm.setValue({
            customerID: freshCustomer.customerID,
            firstName: freshCustomer.firstName,
            lastName: freshCustomer.lastName,
            phone: freshCustomer.phone,
            email: freshCustomer.email,
          });

          this.dialogRef = this.dialog.open(this.editDialogTemplate, {
            width: '400px',
            disableClose: true,
            data: freshCustomer
          });

          this.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.updateCustomer(result);
            }
          });
        },
        error: (error) => {
          console.error('Error fetching customer details:', error);
          // Здесь можно добавить показ сообщения об ошибке пользователю
        }
      });
  }

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
            },
            error: (error) => {
              console.error('Error deleting customer:', error);
            }
          });
      }
    });
  }


  openAddDialog(): void {
    // Сбрасываем форму для нового клиента
    this.editForm.reset();
    // Скрываем поле ID, так как оно будет назначено автоматически
    this.editForm.patchValue({
      customerID: 0  // Временное значение, которое будет игнорироваться при создании
    });

    this.dialogRef = this.dialog.open(this.editDialogTemplate, {
      width: '400px',
      disableClose: true,
      data: { isNewCustomer: true }
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addCustomer(result);
      }
    });
  }

// Метод для добавления нового клиента
addCustomer(newCustomer: any): void {
  this.isLoading = true;

  // Удаляем ID из объекта перед отправкой
  const { customerID, ...customerData } = newCustomer;

  this.customerService.addCustomer(customerData)
    .pipe(
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: (response) => {
        console.log('Customer added successfully', response);
        this.loadCustomers();
      },
      error: (error) => {
        console.error('Error adding customer:', error);
      }
    });
}

}

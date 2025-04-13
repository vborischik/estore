
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  availableMenu: string[] = [];
  menuLoaded = false;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.menuService.getMenu().subscribe(menu => {
      this.availableMenu = menu;
      this.menuLoaded = true;
    });
  }

  hasMenu(item: string): boolean {
    return this.availableMenu.includes(item);
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }
}

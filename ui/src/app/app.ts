import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { HealthResponse } from './health.model';
import { HealthService } from './health.service';
import { PropertyRecord } from './property.model';
import { PropertySearchService } from './property-search.service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly healthService = inject(HealthService);
  private readonly propertySearch = inject(PropertySearchService);
  protected readonly searchForm = new FormGroup({
    address: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly address = this.searchForm.controls.address;
  protected readonly loading = signal(false);
  protected readonly result = signal<PropertyRecord | null>(null);
  protected readonly status = signal<'idle' | 'not-found' | 'error'>('idle');
  protected readonly isHealthLoading = signal(false);
  protected readonly hasHealthCheckResult = signal(false);
  protected readonly healthResult = signal<HealthResponse | null>(null);
  protected readonly healthError = signal(false);
  protected readonly lastHealthCheckTime = signal<Date | null>(null);

  protected checkHealth(): void {
    if (this.isHealthLoading()) return;

    this.isHealthLoading.set(true);
    this.healthError.set(false);
    this.healthService
      .check()
      .pipe(finalize(() => this.isHealthLoading.set(false)))
      .subscribe({
        next: (health) => {
          if (!health?.status || !health?.service) {
            this.setHealthError();
            return;
          }
          this.healthResult.set(health);
          this.hasHealthCheckResult.set(true);
          this.lastHealthCheckTime.set(new Date());
        },
        error: () => this.setHealthError(),
      });
  }

  private setHealthError(): void {
    this.healthResult.set(null);
    this.healthError.set(true);
    this.hasHealthCheckResult.set(true);
    this.lastHealthCheckTime.set(new Date());
  }

  protected search(): void {
    const value = this.address.value.trim();
    this.address.setValue(value);
    this.address.markAsTouched();
    if (!value || this.loading()) return;

    this.loading.set(true);
    this.result.set(null);
    this.status.set('idle');
    this.propertySearch
      .search(value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (property) => this.result.set(property),
        error: (error: HttpErrorResponse) =>
          this.status.set(error.status === 404 ? 'not-found' : 'error'),
      });
  }
}
